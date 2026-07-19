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
        navigate("/login");
        return;
      }

      const redirect =
        params.get("redirect");

      navigate(
        redirect
          ? decodeURIComponent(redirect)
          : "/dashboard",
        { replace: true }
      );
    }

    handleAuth();
  }, []);

  return <div>Signing you in...</div>;
}