export async function GET() {
<<<<<<< HEAD
  return Response.json({ status: "ok", service: "picksy-frontend" });
=======
  return Response.json({
    status: "ok",
    service: "troviio-frontend",
    version: process.env.npm_package_version || "unknown",
    timestamp: new Date().toISOString(),
  });
>>>>>>> 4e3d4795 (feat(chat): Chat IA v2 — clic catégorie → IA parle en premier)
}
