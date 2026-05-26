import { type NextRequest, NextResponse } from 'next/server';
import { kkn } from '@/lib/kakunin';

/**
 * Enforce Kakunin X.509 certificates on all /api/agent/* routes.
 * Agents attach their cert serial in the X-Kakunin-Cert-Serial header.
 *
 * kkn.verify.cert() is a public endpoint — CDN-cached globally, p99 < 500ms.
 * Cache is invalidated automatically when a certificate is revoked.
 */
export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/agent/')) {
    const serial = req.headers.get('x-kakunin-cert-serial');

    if (!serial) {
      return NextResponse.json(
        { error: 'Agent certificate required' },
        { status: 401 }
      );
    }

    const agent = await kkn.verify.cert(serial);

    if (agent.status !== 'active') {
      return NextResponse.json(
        { error: `Certificate ${agent.status}` },
        { status: 403 }
      );
    }

    // Forward the cert serial to route handlers as the verified agent identifier.
    // VerifiedAgent has: status, serial, agent_name, operator_org, permitted_actions.
    // There is no agent.id field — use agent.serial as the unique identity token.
    const headers = new Headers(req.headers);
    headers.set('x-verified-agent-serial', agent.serial);
    headers.set('x-verified-agent-name', agent.agent_name ?? '');
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/agent/:path*'],
};
