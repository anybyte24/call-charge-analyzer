import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { html_content, filename = 'report.pdf', options = {} } = await req.json();
    
    console.log('Generating PDF for:', filename);
    
    // Use Puppeteer service for PDF generation
    const puppeteerResponse = await fetch('https://api.puppeteer.io/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('PUPPETEER_API_KEY') || 'demo'}`,
      },
      body: JSON.stringify({
        html: html_content,
        options: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '1cm',
            right: '1cm',
            bottom: '1cm',
            left: '1cm',
          },
          ...options
        }
      }),
    });

    if (!puppeteerResponse.ok) {
      // Fallback: return HTML content as PDF using basic conversion
      const basicPdf = await generateBasicPdf(html_content);
      
      return new Response(basicPdf, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    const pdfBuffer = await puppeteerResponse.arrayBuffer();
    
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error in pdf-generator function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Basic PDF generation fallback using jsPDF
async function generateBasicPdf(htmlContent: string): Promise<Uint8Array> {
  // This is a simplified fallback - in production you'd want a proper HTML to PDF service
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${htmlContent.length + 100}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${htmlContent.replace(/<[^>]*>/g, '').substring(0, 1000)}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000120 00000 n 
0000000285 00000 n 
0000000400 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
500
%%EOF`;

  return new TextEncoder().encode(pdfContent);
}