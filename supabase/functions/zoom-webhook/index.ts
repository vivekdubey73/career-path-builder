import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js/cors";

const encoder = new TextEncoder();

async function hmacSha256(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const ZOOM_CLIENT_SECRET = Deno.env.get("ZOOM_CLIENT_SECRET");
  if (!ZOOM_CLIENT_SECRET) {
    console.error("ZOOM_CLIENT_SECRET not configured");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Zoom webhook URL validation (CRC challenge-response)
    if (body.event === "endpoint.url_validation") {
      const plainToken = body.payload?.plainToken;
      if (!plainToken) {
        return new Response(JSON.stringify({ error: "Missing plainToken" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const encryptedToken = await hmacSha256(ZOOM_CLIENT_SECRET, plainToken);
      console.log("Zoom URL validation challenge responded");
      return new Response(
        JSON.stringify({ plainToken, encryptedToken }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify webhook signature from Zoom
    const timestamp = req.headers.get("x-zm-request-timestamp");
    const signature = req.headers.get("x-zm-signature");

    if (timestamp && signature) {
      const message = `v0:${timestamp}:${JSON.stringify(body)}`;
      const expectedSig = `v0=${await hmacSha256(ZOOM_CLIENT_SECRET, message)}`;
      if (signature !== expectedSig) {
        console.warn("Invalid Zoom webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const event = body.event as string;
    const meetingId = String(body.payload?.object?.id ?? "");
    const meetingUrl = body.payload?.object?.join_url ?? "";

    console.log(`Zoom event: ${event}, meeting ID: ${meetingId}`);

    if (event === "meeting.started") {
      // Try matching by zoom_meeting_id first, then by URL
      let matched = false;

      if (meetingId) {
        const { data, error } = await supabase
          .from("mentorship_sessions")
          .update({ status: "live" })
          .eq("zoom_meeting_id", meetingId)
          .eq("status", "scheduled")
          .select("id");
        if (!error && data && data.length > 0) {
          matched = true;
          console.log(`Session ${data[0].id} marked as live (by meeting ID)`);
        }
      }

      if (!matched && meetingUrl) {
        const { data, error } = await supabase
          .from("mentorship_sessions")
          .update({ status: "live" })
          .ilike("zoom_meeting_url", `%${meetingId}%`)
          .eq("status", "scheduled")
          .select("id");
        if (!error && data && data.length > 0) {
          console.log(`Session ${data[0].id} marked as live (by URL match)`);
        }
      }
    } else if (event === "meeting.ended") {
      let matched = false;

      if (meetingId) {
        const { data, error } = await supabase
          .from("mentorship_sessions")
          .update({ status: "completed" })
          .eq("zoom_meeting_id", meetingId)
          .eq("status", "live")
          .select("id");
        if (!error && data && data.length > 0) {
          matched = true;
          console.log(`Session ${data[0].id} marked as completed (by meeting ID)`);
        }
      }

      if (!matched && meetingUrl) {
        const { data, error } = await supabase
          .from("mentorship_sessions")
          .update({ status: "completed" })
          .ilike("zoom_meeting_url", `%${meetingId}%`)
          .eq("status", "live")
          .select("id");
        if (!error && data && data.length > 0) {
          console.log(`Session ${data[0].id} marked as completed (by URL match)`);
        }
      }
    } else {
      console.log(`Unhandled Zoom event: ${event}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Zoom webhook error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
