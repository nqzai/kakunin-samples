// NOTE: This file requires @cloudflare/workers-types and is excluded from the
// default tsconfig. Deploy via Wrangler: https://developers.cloudflare.com/workers/

/**
 * Kakunin Edge Gateway — Cloudflare Worker (mTLS + Scope Verification)
 *
 * This sample shows how to intercept incoming API requests at the Cloudflare Edge,
 * validate the client X.509 certificate issued by Kakunin, perform an OCSP revocation
 * check, and enforce scope limitations before routing to microservices.
 *
 * Prerequisites:
 *   1. Configure mTLS on your Cloudflare dashboard (certificates issued by your Kakunin CA).
 *   2. Set the KAKUNIN_VERIFY_URL (e.g., https://kakunin.ai/api/v1/verify)
 */

interface Env {
  KAKUNIN_VERIFY_URL: string;
  UPSTREAM_SERVICE_URL: string;
}

/**
 * Shape of the Kakunin public verify response.
 * GET /api/v1/verify/{serial} — no authentication required.
 *
 * Fields returned: status, serial, agent_name, operator_org, permitted_actions,
 *   model_hash, valid_from, valid_until, issuer, revocation_reason
 */
interface KakuninVerifyResponse {
  data: {
    status: 'active' | 'revoked' | 'expired';
    serial: string;
    agent_name: string;
    operator_org: string | null;
    /** Scopes encoded in the certificate. Field name is permitted_actions (not scopes). */
    permitted_actions: string[];
    model_hash: string | null;
    valid_from: string;
    valid_until: string;
    issuer: string;
    revocation_reason: string | null;
  };
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

    const serialNumber: string = tlsClientAuth.certSerial;

    // 2. Revocation check + scope fetch from Kakunin public verify endpoint.
    // CDN-cached globally — p99 < 500ms, no API key required.
    try {
      const verifyRes = await fetch(`${env.KAKUNIN_VERIFY_URL}/${serialNumber}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!verifyRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to verify certificate status against Kakunin PKI.' }),
          { status: 502, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const { data: certStatus } = await verifyRes.json() as KakuninVerifyResponse;

      if (certStatus.status !== 'active') {
        return new Response(
          JSON.stringify({ error: `Access Denied: Certificate is ${certStatus.status}.` }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 3. Enforce route-to-scope matching against permitted_actions.
      // permitted_actions contains the scopes encoded in the X.509 certificate
      // (field is permitted_actions, not scopes).
      const requiredScope = request.method === 'GET' ? 'read' : 'write';
      const hasScope =
        certStatus.permitted_actions.includes(requiredScope) ||
        certStatus.permitted_actions.includes('*');

      if (!hasScope) {
        return new Response(
          JSON.stringify({
            error: 'Forbidden: Agent certificate does not include the required scope.',
            required: requiredScope,
            present: certStatus.permitted_actions,
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 4. Forward the request to the upstream service, injecting agent context headers.
      // Use serial as the agent identifier — the verify response has no agent_id field.
      const modifiedRequest = new Request(
        env.UPSTREAM_SERVICE_URL + url.pathname + url.search,
        request,
      );
      modifiedRequest.headers.set('X-Agent-Cert-Serial', certStatus.serial);
      modifiedRequest.headers.set('X-Agent-Name', certStatus.agent_name);
      modifiedRequest.headers.set('X-Agent-Scopes', certStatus.permitted_actions.join(','));

      return fetch(modifiedRequest);
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: 'Internal security gateway error.',
          details: (err as Error).message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};
