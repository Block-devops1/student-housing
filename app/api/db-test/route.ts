import { getMongoDatabase } from "@/lib/mongodb";

export async function GET() {
  const db = getMongoDatabase();
  const result = await db.command({ ping: 1 });

  return new Response(JSON.stringify({ status: "ok", result }), {
    headers: { "Content-Type": "application/json" },
  });
}
