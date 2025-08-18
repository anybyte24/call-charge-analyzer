import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <SEO 
        title="404 - Pagina Non Trovata | Call Charge Analyzer"
        description="La pagina che stai cercando non esiste. Torna al dashboard per continuare l'analisi dei costi delle tue telefonate VOIP."
        keywords="404, pagina non trovata, errore"
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Pagina non trovata</p>
          <Button asChild>
            <Link to="/">Torna alla Home</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default NotFound;
