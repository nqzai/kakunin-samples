// NOTE: This file requires express, @supabase/supabase-js, and jsonwebtoken.
// It is excluded from the default tsconfig. Install deps before use:
//   npm install express @supabase/supabase-js jsonwebtoken
//   npm install -D @types/express @types/jsonwebtoken

/**
 * Kakunin Supabase RLS Adapter — Express Middleware
 * 
 * Maps Kakunin agent session certificates dynamically to Postgres Row-Level Security (RLS)
 * policies in Supabase by generating a scoped JWT signed with the Supabase JWT Secret.
 * 
 * This ensures that when the agent queries the database, Postgres natively constrains
 * query results to rows matching the agent's identity.
 * 
 * Setup in PostgreSQL (Supabase):
 *   CREATE POLICY "Agents can access their own tenant data"
 *     ON tenant_data
 *     FOR ALL
 *     USING (agent_id = (auth.jwt() ->> 'sub'));
 */

import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

// Extend the Express Request type to include the scoped Supabase client
declare global {
  namespace Express {
    interface Request {
      supabase?: SupabaseClient;
      agentId?: string;
      agentScopes?: string[];
    }
  }
}

interface AdapterConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseJwtSecret: string; // Used to sign the custom agent token
}

export function kakuninSupabaseRls(config: AdapterConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Retrieve verified agent headers injected by the Edge Gateway (e.g. Cloudflare Worker)
    const agentId = req.headers['x-agent-id'] as string;
    const scopesHeader = req.headers['x-agent-scopes'] as string;

    if (!agentId) {
      return res.status(401).json({ error: 'Unauthorized: Missing agent identity context headers.' });
    }

    const agentScopes = scopesHeader ? scopesHeader.split(',') : [];

    try {
      // 2. Generate a custom JWT representing the agent's authentication context.
      // This mimics a user login but carries the agent's unique ID and scopes.
      const payload = {
        aud: 'authenticated',
        role: 'authenticated',
        sub: agentId,
        app_metadata: {
          provider: 'kakunin',
          scopes: agentScopes
        },
        user_metadata: {
          is_agent: true
        },
        // Ephemeral expiration matching the short-lived certificate (e.g. 1 hour)
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      };

      const agentJwt = jwt.sign(payload, config.supabaseJwtSecret);

      // 3. Instantiate a scoped Supabase client using the custom JWT
      const scopedSupabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${agentJwt}`
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });

      // 4. Attach the client and context to the request object
      req.supabase = scopedSupabase;
      req.agentId = agentId;
      req.agentScopes = agentScopes;

      next();
    } catch (err) {
      res.status(500).json({ error: 'Failed to initialize agent database RLS context.', details: (err as Error).message });
    }
  };
}

// Example usage in an Express router:
// 
// app.get('/api/agent-data', kakuninSupabaseRls(config), async (req, res) => {
//   // Query the database using the scoped client. 
//   // Row-level security automatically filters results to matching rows.
//   const { data, error } = await req.supabase!
//     .from('tenant_data')
//     .select('*');
// 
//   if (error) return res.status(500).json({ error: error.message });
//   res.json({ agent_id: req.agentId, data });
// });
