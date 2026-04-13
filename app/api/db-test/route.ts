import { getMongoClient } from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);
    const result = await db.command({ ping: 1 });

    return new Response(JSON.stringify({ status: "ok", result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DB test error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ status: "error", message: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
