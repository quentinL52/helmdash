// Follows standard Deno Edge Function syntax
// @ts-nocheck
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  try {
    console.log("Syncing financial data...");

    // Simulated task
    const syncedRecords = 42;

    return new Response(
      JSON.stringify({ message: "Finance sync completed successfully", syncedRecords }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});
