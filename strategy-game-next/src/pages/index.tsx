import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/lobby");
    } else {
      router.replace("/login");
    }
  }, [user, router]);

  return <p>Redirecting...</p>;
}
