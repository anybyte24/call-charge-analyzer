import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ALLOWED_EMAILS } from "@/config/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const setSeo = () => {
  document.title = "Login | VOIP Anybyte";
  const desc = "Accedi in modo sicuro a VOIP Anybyte";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", desc);
  else {
    const m = document.createElement("meta");
    m.setAttribute("name", "description");
    m.setAttribute("content", desc);
    document.head.appendChild(m);
  }
  const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (canonical) canonical.href = `${window.location.origin}/auth`;
  else {
    const l = document.createElement("link");
    l.setAttribute("rel", "canonical");
    l.setAttribute("href", `${window.location.origin}/auth`);
    document.head.appendChild(l);
  }
};

const Auth = () => {
  const { user, loading, signInWithEmail, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSeo();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      const allowed = !!user.email && ALLOWED_EMAILS.includes(user.email as any);
      if (allowed) {
        navigate("/", { replace: true });
      } else {
        // In caso di login con email non autorizzata
        toast({
          title: "Accesso non autorizzato",
          description: "Questa email non può accedere all'app.",
          variant: "destructive",
        });
        signOut();
      }
    }
  }, [user, loading, navigate, toast, signOut]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error, data } = await signInWithEmail(email.trim(), password);
      if (error || !data?.user) {
        toast({
          title: "Errore di accesso",
          description: error?.message || "Credenziali non valide",
          variant: "destructive",
        });
        return;
      }

      if (!data.user.email || !ALLOWED_EMAILS.includes(data.user.email as any)) {
        toast({
          title: "Accesso non autorizzato",
          description: "Questa email non può accedere all'app.",
          variant: "destructive",
        });
        await signOut();
        return;
      }

      toast({ title: "Accesso riuscito" });
      navigate("/", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accesso</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Accesso in corso..." : "Accedi"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              La registrazione è disabilitata. Solo email autorizzate possono accedere.
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;
