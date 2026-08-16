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

      /*
      ========================================
      GET AUTH CODE
      ========================================
      */

      const code = params.get("code");

      /*
      ========================================
      GET REDIRECT
      ========================================
      */

      const redirectParam =
        params.get("redirect");

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
      NO CODE
      ========================================
      */

      if (!code) {
        console.error(
          "❌ AUTH CALLBACK: NO CODE"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      /*
      ========================================
      EXCHANGE CODE FOR SESSION
      ========================================
      */

      const {
        data,
        error,
      } =
        await supabase.auth.exchangeCodeForSession(
          code
        );

      console.log(
        "SESSION CREATED:",
        !!data?.session
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

      /*
      ========================================
      DETERMINE DESTINATION
      ========================================
      */

      let destination =
        "/dashboard";

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

      console.log(
        "🚀 AUTH CALLBACK DESTINATION:",
        destination
      );

      /*
      ========================================
      REDIRECT
      ========================================
      */

      if (!cancelled) {
        navigate(
          destination,
          {
            replace: true,
          }
        );
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