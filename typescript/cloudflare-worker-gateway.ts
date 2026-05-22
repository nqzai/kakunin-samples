/**
 * Kakunin Edge Gateway — Cloudflare Worker (mTLS + Scope Verification)
 * 
 * This sample shows how to intercept incoming API requests at the Cloudflare Edge,
 * validate the client X.509 certificate issued by Kakunin, perform an OCSP revocation
 * check, and enforce OAuth-like scope limitations before routing to microservices.
 * 
 * Prerequisites:
 *   1. Configure mTLS on your Cloudflare dashboard (certificates issued by your Kakunin CA).
 *   2. Set the KAKUNIN_VERIFY_URL (e.g., https://kakunin.ai/api/v1/verify)
 */

interface Env {
  KAKUNIN_VERIFY_URL: string;
  UPSTREAM_SERVICE_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Check if mTLS was completed by Cloudflare edge
    const tlsClientAuth = (request as any).cf?.tlsClientAuth;
    if (!tlsClientAuth || tlsClientAuth.certPresented !== 'SUCCESS') {
      return new Response(
        JSON.stringify({ error: 'mTLS certificate required. Connection rejected.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (tlsClientAuth.certVerified !== 'SUCCESS') {
      return new Response(
        JSON.stringify({ error: `Certificate verification failed: ${tlsClientAuth.certVerified}` }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const serialNumber = tlsClientAuth.certSerial;
    const subjectDN = tlsClientAuth.certSubjectDN;

    // 2. Perform high-performance revocation check & fetch scopes from Kakunin resolver
    // Note: Cloudflare Workers cache these requests to keep edge overhead under 2ms.
    try {
      const verifyRes = await fetch(`${env.KAKUNIN_VERIFY_URL}/${serialNumber}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!verifyRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to verify certificate status against Kakunin PKI.' }),
          { status: 502, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const certStatus = await verifyRes.json() as {
        status: 'active' | 'revoked';
        scopes: string[];
        agent_id: string;
      };

      if (certStatus.status === 'revoked') {
        return new Response(
          JSON.stringify({ error: 'Access Denied: Certificate has been revoked by Kakunin Risk Engine.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 3. Enforce route-to-scope matching
      // e.g. POST requests require the 'write' scope, GET requests require 'read'
      const requiredScope = request.method === 'GET' ? 'read' : 'write';
      const hasScope = certStatus.scopes.includes(requiredScope) || certStatus.scopes.includes('*');

      if (!hasScope) {
        return new Response(
          JSON.stringify({
            error: 'Forbidden: Agent possesses invalid scopes.',
            required: requiredScope,
            present: certStatus.scopes
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 4. Forward the request to the upstream service, injecting agent context headers
      const modifiedRequest = new Request(env.UPSTREAM_SERVICE_URL + url.pathname + url.search, request);
      modifiedRequest.headers.set('X-Agent-ID', certStatus.agent_id);
      modifiedRequest.headers.set('X-Agent-Scopes', certStatus.scopes.join(','));
      modifiedRequest.headers.set('X-Agent-Cert-Serial', serialNumber);

      return fetch(modifiedRequest);

    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Internal security gateway error.', details: (err as Error).message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
};
