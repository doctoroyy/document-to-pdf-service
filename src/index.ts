import { marked } from 'marked';
import { mermaidExtension, inlineMathExtension, blockMathExtension } from './extensions/marked-extensions';
import { configPage } from './templates/config-page';
import { createCORSResponse } from './utils/cors';
import { generatePDF, determineFilename, type PaperFormat } from './utils/pdf-generator';

// Register all extensions
marked.use({ extensions: [mermaidExtension, inlineMathExtension, blockMathExtension] });

export interface Env {
  // Browser binding for Cloudflare Workers
  MYBROWSER: any;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle OPTIONS for CORS preflight requests
    if (request.method === 'OPTIONS') {
      return createCORSResponse();
    }

    try {
      const url = new URL(request.url);
      const params = url.searchParams;
      
      // Check if any parameters are passed, return the configuration page if none
      if (params.toString() === '') {
        const configResponse = new Response(configPage, {
          headers: {
            'Content-Type': 'text/html;charset=UTF-8'
          }
        });
        return createCORSResponse({ response: configResponse });
      }
      
      // Get custom filename if provided
      const customFilename = params.get('filename');
      
      // Get input parameters from URL query
      const sourceUrl = params.get('url');
      const html = params.get('html');
      const markdown = params.get('markdown');
      const base64 = params.get('base64');
      const isMarkdown = params.get('isMarkdown') === 'true';
      
      // Optional PDF settings
      const formatParam = params.get('format') || 'A4';
      // Validate format is a valid PaperFormat
      const format = ['Letter', 'Legal', 'Tabloid', 'Ledger', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'].includes(formatParam) 
                    ? formatParam as PaperFormat 
                    : 'A4';
      const printBackground = params.get('printBackground') !== 'false';
      
      // Parse margin parameters if provided
      let margin = { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' };
      const marginTop = params.get('marginTop');
      const marginRight = params.get('marginRight');
      const marginBottom = params.get('marginBottom');
      const marginLeft = params.get('marginLeft');
      
      if (marginTop) margin.top = marginTop;
      if (marginRight) margin.right = marginRight;
      if (marginBottom) margin.bottom = marginBottom;
      if (marginLeft) margin.left = marginLeft;

      // Check if we have valid input
      if (!sourceUrl && !html && !markdown && !base64) {
        return createCORSResponse({
          body: 'Please provide either "url", "html", "markdown", or "base64" as a query parameter',
          status: 400
        });
      }

      // Generate PDF
      const pdfOptions = {
        format,
        printBackground,
        margin
      };
      
      const pdfBuffer = await generatePDF({
        sourceUrl,
        html,
        markdown,
        base64,
        isMarkdown,
        pdfOptions,
        browserInstance: env.MYBROWSER
      });

      // Get filename
      const filename = determineFilename(customFilename, sourceUrl);

      // Create PDF response
      const pdfResponse = new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });

      // Return the PDF with CORS headers
      return createCORSResponse({ response: pdfResponse });
    } catch (error: unknown) {
      console.error('Error generating PDF:', error);
      return createCORSResponse({
        body: `Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 500
      });
    }
  }
} satisfies ExportedHandler<Env>;
