import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Join() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Joining team...");

  useEffect(() => {
    let cancelled = false;

    async function joinTeam() {
      console.log("🔥 JOIN PAGE OPENED");

      let token = params.get("token");

      console.log("RAW TOKEN:", token);

      if (token?.startsWith("/join?token=")) {
        token = token.replace("/join?token=", "");
      }

      console.log("FINAL TOKEN:", token);

      if (!token) {
        console.error("❌ No invite token");
        setStatus("Invalid invitation link.");
        return;
      }

      /*
      ========================================
      GET CURRENT SESSION
      ========================================
      */

      let {
        data: { session },
      } = await supabase.auth.getSession();

      console.log(
        "SESSION:",
        session
          ? "FOUND"
          : "NOT FOUND"
      );

      /*
      ========================================
      WAIT FOR AUTH SESSION
      ========================================
      */

      if (!session) {
        console.log(
          "⏳ Waiting for authentication session..."
        );

        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );

          const result =
            await supabase.auth.getSession();

          session = result.data.session;

          console.log(
            `AUTH RETRY ${i + 1}:`,
            session
              ? "FOUND"
              : "NOT FOUND"
          );

          if (session) {
            break;
          }
        }
      }

      /*
      ========================================
      NO SESSION → LOGIN
      ========================================
      */

      if (!session) {
        console.log(
          "❌ No session. Redirecting to login."
        );

        const redirect =
          `/join?token=${encodeURIComponent(token)}`;

        window.location.replace(
          `/login?redirect=${encodeURIComponent(
            redirect
          )}`
        );

        return;
      }

      console.log(
        "✅ AUTHENTICATED USER:",
        session.user?.email
      );

      /*
      ========================================
      CALL BACKEND
      ========================================
      */

      setStatus("Accepting invitation...");

      const apiUrl =
        `${window.location.origin}/api/acceptInvite`;

      console.log(
        "🚀 POSTING TO:",
        apiUrl
      );

      console.log(
        "ACCESS TOKEN PRESENT:",
        !!session.access_token
      );

      const response =
        await fetch(
          apiUrl,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              inviteToken: token,
            }),
          }
        );

      console.log(
        "📡 ACCEPT INVITE STATUS:",
        response.status
      );

      const text =
        await response.text();

      console.log(
        "📡 ACCEPT INVITE RAW RESPONSE:",
        text
      );

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        result = {
          error: text,
        };
      }

      console.log(
        "📡 ACCEPT INVITE RESULT:",
        result
      );

      if (!response.ok) {
        console.error(
          "❌ ACCEPT INVITE FAILED:",
          result
        );

        setStatus(
          result.error ||
          "Could not accept invitation."
        );

        return;
      }

      console.log(
        "🎉 TEAM JOIN SUCCESS:",
        result
      );

      if (!cancelled) {
        setStatus(
          "🎉 You joined the team!"
        );
      }

      /*
      ========================================
      GIVE SUPABASE A MOMENT
      ========================================
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      /*
      ========================================
      GO HOME
      ========================================
      */

      console.log(
        "🏠 Redirecting to dashboard..."
      );

      window.location.replace("/");
    }

    joinTeam();

    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontSize: 24,
        padding: 40,
        textAlign: "center",
      }}
    >
      <div>{status}</div>
    </div>
  );
}