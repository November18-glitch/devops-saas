import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    async function handleAuth() {

      const code = params.get("code");

      if (!code) {
        navigate("/login");
        return;
      }

      const { error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error(error);
        navigate("/login");
        return;
      }

      const redirect = params.get("redirect");

      if (redirect) {
        window.location.replace(
          decodeURIComponent(redirect)
        );
      } else {
        window.location.replace("/dashboard");
      }

    }

    handleAuth();
  }, []);

  return <div>Signing you in...</div>;
}