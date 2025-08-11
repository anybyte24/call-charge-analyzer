import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ALLOWED_EMAILS } from "@/config/auth";
import { useToast } from "@/hooks/use-toast";

export const ProtectedRoute = () => {
  const { user, loading, signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const [kicked, setKicked] = useState(false);

  // Email whitelist check (compute before any returns)
  const isAllowed = !!user?.email && ALLOWED_EMAILS.includes(user.email as any);

  // Ensure hooks are not conditional: effect must be declared before any returns
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

  // Loading state
  if (loading) return null;

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
