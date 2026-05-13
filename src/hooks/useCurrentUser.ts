import { useEffect, useState } from "react";
import { me, type CurrentUser } from "../api/auth";

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let alive = true;
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    me()
      .then((u) => {
        if (alive) setUser(u);
      })
      .catch(() => {
        if (alive) setUser(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  return user;
}
