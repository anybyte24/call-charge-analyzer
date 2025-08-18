import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({
  title = 'Call Charge Analyzer - Analisi Costi Telefonate VOIP',
  description = 'Analizza e ottimizza i costi delle tue telefonate VOIP con report dettagliati, gestione clienti e analisi avanzate. Soluzione professionale per aziende.',
  keywords = 'analisi costi telefonici, VOIP, gestione telefonate, analisi chiamate, costi telefonia, report telefonici, ottimizzazione costi',
  image = '/placeholder.svg',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
}: SEOProps) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('robots', 'index, follow');
    updateMeta('viewport', 'width=device-width, initial-scale=1.0');
    
    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', type, true);
    updateMeta('og:url', url, true);
    updateMeta('og:image', image, true);
    updateMeta('og:site_name', 'Call Charge Analyzer', true);
    updateMeta('og:locale', 'it_IT', true);

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);

    // JSON-LD Structured Data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Call Charge Analyzer',
      description: description,
      url: url,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
      },
      provider: {
        '@type': 'Organization',
        name: 'Anybyte',
        url: 'https://anybyte.it',
      },
    };

    let scriptTag = document.querySelector('script[data-type="structured-data"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-type', 'structured-data');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, image, url, type]);

  return null;
};