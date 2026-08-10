import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Join() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState("Joining team...");

  useEffect(() => {
    let cancelled = false;

    async function joinTeam() {
      try {
        console.log("========== JOIN PAGE ==========");

        // -----------------------------------
        // 1. GET TOKEN FROM URL
        // -----------------------------------

        let token = params.get("token");

        if (token?.startsWith("/join?token=")) {
          token = token.replace("/join?token=", "");
        }

        if (token) {
          token = decodeURIComponent(token);
        }

        token = token?.trim();

        console.log("INVITE TOKEN:", token);

        if (!token) {
          console.error("No invite token found.");

          if (!cancelled) {
            setMessage("Invalid invitation link.");
          }

          return;
        }

        // -----------------------------------
        // 2. CHECK SESSION
        // -----------------------------------

        let {
          data: { session },
        } = await supabase.auth.getSession();

        console.log(
          "SESSION:",
          session
            ? {
                userId: session.user?.id,
                email: session.user?.email,
              }
            : null
        );

        // -----------------------------------
        // 3. IF NOT LOGGED IN → LOGIN
        // -----------------------------------

        if (!session) {
          console.log(
            "No session. Redirecting to login..."
          );

          const redirect =
            `/join?token=${encodeURIComponent(token)}`;

          window.location.replace(
            "/login?redirect=" +
              encodeURIComponent(redirect)
          );

          return;
        }

        // -----------------------------------
        // 4. MAKE SURE SESSION IS FRESH
        // -----------------------------------

        const {
          data: refreshedSessionData,
        } = await supabase.auth.refreshSession();

        if (refreshedSessionData?.session) {
          session =
            refreshedSessionData.session;
        }

        console.log(
          "AUTHENTICATED USER:",
          {
            id: session.user?.id,
            email: session.user?.email,
          }
        );

        if (!session.user) {
          console.error(
            "Session exists but no user exists."
          );

          window.location.replace(
            "/login?redirect=" +
              encodeURIComponent(
                `/join?token=${token}`
              )
          );

          return;
        }

        // -----------------------------------
        // 5. CALL BACKEND
        // -----------------------------------

        if (!cancelled) {
          setMessage("Accepting invitation...");
        }

        console.log(
          "CALLING /api/acceptInvite"
        );

        const response = await fetch(
          "/api/acceptInvite",
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

        // -----------------------------------
        // 6. READ RESPONSE
        // -----------------------------------

        let result = {};

        try {
          result = await response.json();
        } catch {
          result = {
            error:
              "Invalid response from server.",
          };
        }

        console.log(
          "ACCEPT INVITE RESPONSE:",
          {
            status: response.status,
            ok: response.ok,
            result,
          }
        );

        if (!response.ok) {
          console.error(
            "ACCEPT INVITE FAILED:",
            result
          );

          if (!cancelled) {
            setMessage(
              result.error ||
                "Could not accept invitation."
            );
          }

          return;
        }

        // -----------------------------------
        // 7. SUCCESS
        // -----------------------------------

        console.log(
          "========== TEAM JOIN SUCCESS =========="
        );

        console.log(
          "Team ID:",
          result.teamId
        );

        console.log(
          "Member ID:",
          result.memberId
        );

        console.log(
          "Invite ID:",
          result.inviteId
        );

        if (!cancelled) {
          setMessage(
            "🎉 You joined the team!"
          );
        }

        // Give Supabase a moment to update
        // the auth/client state before redirect.
        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        );

        window.location.replace("/");

      } catch (error) {
        console.error(
          "JOIN PAGE ERROR:",
          error
        );

        if (!cancelled) {
          setMessage(
            error?.message ||
              "Something went wrong while joining the team."
          );
        }
      }
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
        padding: 40,
        textAlign: "center",
      }}
    >
      <div>
        <h1>LaunchAlly</h1>

        <p
          style={{
            fontSize: 20,
            marginTop: 20,
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}