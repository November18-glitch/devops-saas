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
        window.location.replace("/login");
        return;
      }

      const { error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error(error);
        window.location.replace("/login");
        return;
      }

      window.location.replace("/login");
    }

    handleAuth();
  }, [params]);

  return <div>Signing you in...</div>;
}