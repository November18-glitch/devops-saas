import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="flex items-center gap-6">
        {profile?.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />
        )}

        <div>
          <p className="font-semibold text-lg">
            {profile?.full_name || "No name yet"}
          </p>

          <p className="text-gray-500">{profile?.email}</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        To edit your profile, go to <strong>Profile Settings</strong>.
      </p>
    </div>
  );
}
