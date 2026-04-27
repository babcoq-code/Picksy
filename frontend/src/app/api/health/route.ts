export async function GET() {
  return Response.json({
    status: "ok",
    service: "troviio-frontend",
    version: process.env.npm_package_version || "unknown",
    timestamp: new Date().toISOString(),
  });
}
