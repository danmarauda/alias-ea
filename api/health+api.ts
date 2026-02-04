/**
 * Health Check API Route
 *
 * Simple health check endpoint for monitoring and load balancers.
 * Returns 200 OK if the service is running.
 */

export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ALIAS Executive Agent',
    version: '1.0.0',
  });
}
