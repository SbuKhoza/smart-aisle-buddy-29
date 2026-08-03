import { useEffect, useState } from "react";
import { useAuth } from "./firebase-auth";
import { isAdminUser } from "./services/admin";

export function useIsAdmin() {
  const { user, ready } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!ready) return;
    if (!user) {
      setIsAdmin(false);
      setChecked(true);
      return;
    }
    isAdminUser(user.uid).then((v) => {
      if (!cancelled) {
        setIsAdmin(v);
        setChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user, ready]);

  return { isAdmin, checked };
}
