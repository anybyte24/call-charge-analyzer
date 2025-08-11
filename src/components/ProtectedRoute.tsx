import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ALLOWED_EMAILS } from "@/config/auth";
import { useToast } from "@/hooks/use-toast";

export const ProtectedRoute = () => {
  const { user, loading, signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const [kicked, setKicked] = useState(false);

  // Loading state
  if (loading) return null;

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Email whitelist check
  const isAllowed = !!user.email && ALLOWED_EMAILS.includes(user.email as any);

  useEffect(() => {
    if (user && !isAllowed && !kicked) {
      setKicked(true);
      toast({
        title: "Accesso non autorizzato",
        description: "L'email non è abilitata per accedere a questa app.",
        variant: "destructive",
      });
      // Best-effort sign out
      signOut();
    }
  }, [user, isAllowed, kicked, signOut, toast]);

  if (!isAllowed) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
