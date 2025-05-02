import puppeteer from '@cloudflare/puppeteer';
import { marked } from 'marked';
import { markdownStyle } from '../templates/styles';

// Valid paper formats for Puppeteer
export type PaperFormat = 'Letter' | 'Legal' | 'Tabloid' | 'Ledger' | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6';

export interface PDFOptions {
  format: PaperFormat;
  printBackground: boolean;
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export interface PDFGenerationParams {
  sourceUrl?: string | null;
  html?: string | null;
  markdown?: string | null;
  base64?: string | null;
  isMarkdown?: boolean;
  pdfOptions: PDFOptions;
  browserInstance: any;
}

export async function generatePDF(params: PDFGenerationParams): Promise<Buffer> {
  const {
    sourceUrl,
    html,
    markdown,
    base64,
    isMarkdown,
    pdfOptions,
    browserInstance
  } = params;

  // Launch browser with the browserInstance binding
  const browser = await puppeteer.launch(browserInstance);
  const page = await browser.newPage();

  try {
    // Handle different input types
    if (sourceUrl) {
      // Navigate to URL
      await page.goto(sourceUrl, { waitUntil: 'networkidle0' });
    } else if (html) {
      // Set HTML content directly
      await page.setContent(html, { waitUntil: 'networkidle0' });
    } else if (markdown) {
      // Convert Markdown to HTML with styling and add mermaid support
      const htmlContent = generateMarkdownHtml(markdown);
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Wait a bit to ensure mermaid diagrams are rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else if (base64) {
      // Decode base64 to HTML or Markdown
      try {
        const decodedContent = atob(base64);
        if (isMarkdown) {
          // Convert Markdown to HTML with styling and add mermaid support
          const htmlContent = generateMarkdownHtml(decodedContent);
          await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
          
          // Wait a bit to ensure mermaid diagrams are rendered
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          await page.setContent(decodedContent, { waitUntil: 'networkidle0' });
        }
      } catch (e) {
        throw new Error('Invalid base64 string');
      }
    }

    // Generate PDF
    const pdfBuffer = await page.pdf(pdfOptions);
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

function generateMarkdownHtml(markdownContent: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${markdownStyle}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <script src="https://unpkg.com/mermaid@11.6.0/dist/mermaid.min.js"></script>
        <script>
          // Initialize mermaid when the page loads
          document.addEventListener('DOMContentLoaded', function() {
            if (typeof mermaid !== 'undefined') {
              mermaid.initialize({
                startOnLoad: true,
                theme: 'default',
                securityLevel: 'loose',
                flowchart: { useMaxWidth: true, htmlLabels: true },
                sequence: { useMaxWidth: true }
              });
            }
          });
        </script>
      </head>
      <body>
        <div class="markdown-body">
          ${marked.parse(markdownContent)}
        </div>
      </body>
    </html>`;
}

export function determineFilename(customFilename: string | null, sourceUrl: string | null): string {
  // Get filename
  let filename = customFilename || 'document.pdf';
  if (!filename.endsWith('.pdf')) {
    filename += '.pdf';
  }
  
  if (!customFilename && sourceUrl) {
    try {
      const urlObj = new URL(sourceUrl);
      const pathParts = urlObj.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== '/') {
        filename = lastPart.replace(/\.[^/.]+$/, '') + '.pdf';
      } else {
        filename = urlObj.hostname + '.pdf';
      }
    } catch (e) {
      // Use default filename if URL parsing fails
    }
  }
  
  return filename;
} 