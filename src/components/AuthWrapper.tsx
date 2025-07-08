import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, LogIn, UserPlus, Zap } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { DashboardSkeleton } from './LoadingSkeletons';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading, signInWithEmail, signUpWithEmail, signOut, signInAnonymously, isTemporary } = useSupabaseAuth();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
              <User className="h-6 w-6" />
              <span>Call Analytics</span>
            </CardTitle>
            <p className="text-gray-600">Accedi per salvare le tue analisi</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Demo Mode Button */}
              <Button
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await signInAnonymously();
                    toast({
                      title: "Modalità Demo Attivata",
                      description: "Puoi utilizzare l'app senza registrarti. I dati saranno salvati localmente."
                    });
                  } catch (error) {
                    toast({
                      title: "Errore",
                      description: "Impossibile attivare la modalità demo.",
                      variant: "destructive"
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="w-full"
                variant="outline"
                disabled={isSubmitting}
              >
                <Zap className="mr-2 h-4 w-4" />
                Inizia Demo (senza registrazione)
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">oppure</span>
                </div>
              </div>

              {/* Auth Tabs */}
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Accedi</TabsTrigger>
                  <TabsTrigger value="signup">Registrati</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="tua@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      if (!email || !password) {
                        toast({
                          title: "Campi mancanti",
                          description: "Inserisci email e password.",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      setIsSubmitting(true);
                      try {
                        const { error } = await signInWithEmail(email, password);
                        if (error) throw error;
                        
                        toast({
                          title: "Accesso effettuato",
                          description: "Benvenuto in Call Analytics!"
                        });
                      } catch (error: any) {
                        toast({
                          title: "Errore nell'accesso",
                          description: error.message || "Credenziali non valide.",
                          variant: "destructive"
                        });
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Accedi
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="tua@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      if (!email || !password) {
                        toast({
                          title: "Campi mancanti",
                          description: "Inserisci email e password.",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      if (password.length < 6) {
                        toast({
                          title: "Password troppo corta",
                          description: "La password deve essere di almeno 6 caratteri.",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      setIsSubmitting(true);
                      try {
                        const { error } = await signUpWithEmail(email, password);
                        if (error) throw error;
                        
                        toast({
                          title: "Registrazione completata",
                          description: "Controlla la tua email per confermare l'account."
                        });
                      } catch (error: any) {
                        toast({
                          title: "Errore nella registrazione",
                          description: error.message || "Impossibile creare l'account.",
                          variant: "destructive"
                        });
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registrati
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Top bar with user info */}
      <div className="bg-white/80 backdrop-blur-sm border-b px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium">
              {isTemporary ? 'Modalità Demo' : user.email}
            </span>
            {isTemporary && (
              <Badge variant="secondary" className="text-xs">Demo</Badge>
            )}
          </div>
          <Button
            onClick={async () => {
              await signOut();
              if (isTemporary) {
                // Clear demo data
                localStorage.removeItem('temp_user');
                localStorage.removeItem('analysis_sessions');
              }
              toast({
                title: "Disconnesso",
                description: "Alla prossima!"
              });
            }}
            variant="outline"
            size="sm"
          >
            Esci
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default AuthWrapper;