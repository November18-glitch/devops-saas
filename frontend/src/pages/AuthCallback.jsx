import { useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function handleAuth() {
      console.log("========== AUTH CALLBACK ==========");

      const code = params.get("code");
      const redirectParam = params.get("redirect");

      console.log(
        "AUTH CODE PRESENT:",
        !!code
      );

      console.log(
        "REDIRECT PARAM:",
        redirectParam
      );

      /*
      ========================================
      EXCHANGE AUTH CODE
      ========================================
      */

      if (code) {
        const { error } =
          await supabase.auth.exchangeCodeForSession(
            code
          );

        if (error) {
          console.error(
            "❌ AUTH CALLBACK ERROR:",
            error
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        console.log(
          "✅ AUTH SESSION CREATED"
        );
      }

      /*
      ========================================
      GET CURRENT SESSION
      ========================================
      */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log(
        "SESSION AFTER CALLBACK:",
        !!session
      );

      if (!session) {
        console.error(
          "❌ NO SESSION AFTER AUTH CALLBACK"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      /*
      ========================================
      FIND WHERE TO GO
      ========================================
      */

      let destination = null;

      /*
      First priority:
      explicit redirect from login/register
      */

      if (redirectParam) {
        try {
          destination =
            decodeURIComponent(
              redirectParam
            );
        } catch {
          destination =
            redirectParam;
        }
      }

      /*
      Second priority:
      remembered invitation token
      */

      if (!destination) {
        const pendingInviteToken =
          localStorage.getItem(
            "pendingInviteToken"
          );

        if (pendingInviteToken) {
          destination =
            `/join?token=${encodeURIComponent(
              pendingInviteToken
            )}`;

          console.log(
            "🎟️ FOUND PENDING INVITE:",
            pendingInviteToken
          );
        }
      }

      /*
      Final fallback:
      normal dashboard
      */

      if (!destination) {
        destination = "/dashboard";
      }

      console.log(
        "🚀 FINAL AUTH DESTINATION:",
        destination
      );

      /*
      ========================================
      GO THERE
      ========================================
      */

      if (!cancelled) {
        navigate(destination, {
          replace: true,
        });
      }
    }

    handleAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate, params]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontSize: 22,
        padding: 40,
        textAlign: "center",
      }}
    >
      <div>
        Signing you in...
      </div>
    </div>
  );
}