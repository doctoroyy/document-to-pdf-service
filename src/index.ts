import puppeteer from '@cloudflare/puppeteer';
// Add marked package for Markdown parsing
import { marked } from 'marked';
import { type TokenizerExtension, type RendererExtension } from 'marked';
import katex from 'katex';
// We'll only import the mermaid types for TypeScript support

// Extension for marked to handle Mermaid diagrams
const mermaidExtension: TokenizerExtension & RendererExtension = {
  name: 'mermaid',
  level: 'block',
  start(src: string) {
    return src.indexOf('```mermaid');
  },
  tokenizer(src: string) {
    const match = src.match(/^```mermaid\n([\s\S]+?)```/);
    if (match) {
      return {
        type: 'mermaid',
        raw: match[0],
        text: match[1].trim()
      };
    }
    return undefined;
  },
  renderer(token: any) {
    return `<div class="mermaid">${token.text}</div>`;
  }
};

// Extension for marked to handle inline KaTeX math
const inlineMathExtension: TokenizerExtension & RendererExtension = {
  name: 'inlineMath',
  level: 'inline',
  start(src: string) {
    return src.indexOf('$');
  },
  tokenizer(src: string) {
    const match = src.match(/^\$([^$\n]+?)\$/);
    if (match && match[0].charAt(0) === '$' && match[0].charAt(match[0].length - 1) === '$') {
      return {
        type: 'inlineMath',
        raw: match[0],
        text: match[1].trim()
      };
    }
    return undefined;
  },
  renderer(token: any) {
    try {
      return katex.renderToString(token.text, { throwOnError: false, displayMode: false });
    } catch (error) {
      console.error('KaTeX inline render error:', error);
      return `<span class="katex-error">${token.text}</span>`;
    }
  }
};

// Extension for marked to handle block KaTeX math
const blockMathExtension: TokenizerExtension & RendererExtension = {
  name: 'blockMath',
  level: 'block',
  start(src: string) {
    return src.indexOf('$$');
  },
  tokenizer(src: string) {
    const match = src.match(/^\$\$([\s\S]+?)\$\$/);
    if (match) {
      return {
        type: 'blockMath',
        raw: match[0],
        text: match[1].trim()
      };
    }
    return undefined;
  },
  renderer(token: any) {
    try {
      return katex.renderToString(token.text, { throwOnError: false, displayMode: true });
    } catch (error) {
      console.error('KaTeX block render error:', error);
      return `<div class="katex-error">${token.text}</div>`;
    }
  }
};

// Register all extensions
marked.use({ extensions: [mermaidExtension, inlineMathExtension, blockMathExtension] });

export interface Env {
  // Browser binding for Cloudflare Workers
  MYBROWSER: any;
}

// Valid paper formats for Puppeteer
type PaperFormat = 'Letter' | 'Legal' | 'Tabloid' | 'Ledger' | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6';

// Markdown styling template
const markdownStyle = `
<style>
  .markdown-body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    word-wrap: break-word;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    color: #24292e;
  }
  .markdown-body h1, .markdown-body h2 {
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }
  .markdown-body h1 { font-size: 2em; margin: 0.67em 0; }
  .markdown-body h2 { font-size: 1.5em; }
  .markdown-body h3 { font-size: 1.25em; }
  .markdown-body h4 { font-size: 1em; }
  .markdown-body h5 { font-size: 0.875em; }
  .markdown-body h6 { font-size: 0.85em; }
  .markdown-body blockquote {
    margin: 0;
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
  }
  .markdown-body code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(27,31,35,0.05);
    border-radius: 3px;
    font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  }
  .markdown-body pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 3px;
  }
  .markdown-body pre code {
    display: inline;
    padding: 0;
    margin: 0;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
    background-color: transparent;
    border: 0;
  }
  .markdown-body table {
    border-spacing: 0;
    border-collapse: collapse;
    width: 100%;
    overflow: auto;
  }
  .markdown-body table th {
    font-weight: 600;
  }
  .markdown-body table th, .markdown-body table td {
    padding: 6px 13px;
    border: 1px solid #dfe2e5;
  }
  .markdown-body table tr {
    background-color: #fff;
    border-top: 1px solid #c6cbd1;
  }
  .markdown-body table tr:nth-child(2n) {
    background-color: #f6f8fa;
  }
  .markdown-body img {
    max-width: 100%;
    box-sizing: content-box;
  }
  .markdown-body hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
  }
  .markdown-body ul, .markdown-body ol {
    padding-left: 2em;
  }
  .markdown-body li + li {
    margin-top: 0.25em;
  }
  /* Mermaid diagram styling */
  .mermaid {
    margin: 20px 0;
  }
</style>`;

// HTML Configuration Page
const configPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document to PDF Service</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #2c3e50;
    }
    .tabs {
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      margin-right: 5px;
      border: 1px solid #ddd;
      border-bottom: none;
      border-radius: 5px 5px 0 0;
      background-color: #f8f9fa;
    }
    .tab.active {
      background-color: #fff;
      border-bottom: 1px solid #fff;
      margin-bottom: -1px;
      font-weight: bold;
      color: #3498db;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input[type="text"], textarea, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    textarea {
      min-height: 150px;
      font-family: monospace;
    }
    .options {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
    }
    .options h3 {
      margin-top: 0;
      margin-bottom: 15px;
    }
    button {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #2980b9;
    }
    .result {
      margin-top: 20px;
    }
    .result pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    .input-row {
      display: flex;
      gap: 10px;
    }
    .input-row .form-group {
      flex: 1;
    }
  </style>
</head>
<body>
  <h1>Document to PDF Service</h1>
  
  <div class="tabs">
    <div class="tab active" data-tab="url">By URL</div>
    <div class="tab" data-tab="html">By HTML</div>
    <div class="tab" data-tab="markdown">By Markdown</div>
    <div class="tab" data-tab="base64">By Base64</div>
  </div>
  
  <div class="form-group">
    <label for="filename-input">Output Filename (optional)</label>
    <input type="text" id="filename-input" placeholder="e.g., document.pdf">
  </div>
  
  <div class="tab-content active" id="url-content">
    <div class="form-group">
      <label for="url-input">Website URL</label>
      <input type="text" id="url-input" placeholder="e.g., https://example.com">
    </div>
  </div>
  
  <div class="tab-content" id="html-content">
    <div class="form-group">
      <label for="html-input">HTML Content</label>
      <textarea id="html-input" placeholder="<html><body><h1>Hello World</h1></body></html>"></textarea>
    </div>
  </div>

  <div class="tab-content" id="markdown-content">
    <div class="form-group">
      <label for="markdown-input">Markdown Content</label>
      <textarea id="markdown-input" placeholder="# Hello World

This is a sample Markdown document.

## Features
- Support for **bold** and *italic* text
- Lists and tables
- Code blocks"></textarea>
    </div>
  </div>
  
  <div class="tab-content" id="base64-content">
    <div class="form-group">
      <label for="base64-input">Base64 Encoded Content (HTML or Markdown)</label>
      <textarea id="base64-input" placeholder="PGh0bWw+PGJvZHk+PGgxPkhlbGxvIFdvcmxkPC9oMT48L2JvZHk+PC9odG1sPg=="></textarea>
    </div>
    <div class="form-group">
      <label>
        <input type="checkbox" id="base64-is-markdown" checked>
        Input is Markdown
      </label>
    </div>
  </div>
  
  <div class="options">
    <h3>PDF Options</h3>
    <div class="form-group">
      <label for="format-select">Paper Format</label>
      <select id="format-select">
        <option value="A4" selected>A4</option>
        <option value="A3">A3</option>
        <option value="A5">A5</option>
        <option value="Letter">Letter</option>
        <option value="Legal">Legal</option>
        <option value="Tabloid">Tabloid</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>
        <input type="checkbox" id="print-background" checked>
        Print Background
      </label>
    </div>
    
    <div class="form-group">
      <label>Page Margins</label>
      <div class="input-row">
        <div class="form-group">
          <label for="margin-top">Top</label>
          <input type="text" id="margin-top" value="1cm">
        </div>
        <div class="form-group">
          <label for="margin-right">Right</label>
          <input type="text" id="margin-right" value="1cm">
        </div>
        <div class="form-group">
          <label for="margin-bottom">Bottom</label>
          <input type="text" id="margin-bottom" value="1cm">
        </div>
        <div class="form-group">
          <label for="margin-left">Left</label>
          <input type="text" id="margin-left" value="1cm">
        </div>
      </div>
    </div>
  </div>
  
  <div style="margin-top: 20px; text-align: center;">
    <button id="generate-btn">Generate PDF</button>
  </div>
  
  <div class="result" style="margin-top: 20px;">
    <h3>Generated URL</h3>
    <pre id="result-url"></pre>
    <p>Clicking the "Generate PDF" button will download the PDF file directly.</p>
  </div>

  <script>
    // Switch tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + '-content').classList.add('active');
        
        updateUrl();
      });
    });
    
    // Update URL
    function updateUrl() {
      const activeTab = document.querySelector('.tab.active').dataset.tab;
      let params = new URLSearchParams();
      
      // Add filename if provided
      const filename = document.getElementById('filename-input').value.trim();
      if (filename) {
        params.append('filename', filename);
      }
      
      // Add content parameters
      if (activeTab === 'url') {
        const url = document.getElementById('url-input').value.trim();
        if (url) params.append('url', url);
      } else if (activeTab === 'html') {
        const html = document.getElementById('html-input').value.trim();
        if (html) params.append('html', html);
      } else if (activeTab === 'markdown') {
        const markdown = document.getElementById('markdown-input').value.trim();
        if (markdown) params.append('markdown', markdown);
      } else if (activeTab === 'base64') {
        const base64 = document.getElementById('base64-input').value.trim();
        const isMarkdown = document.getElementById('base64-is-markdown').checked;
        if (base64) {
          params.append('base64', base64);
          params.append('isMarkdown', isMarkdown.toString());
        }
      }
      
      // Add configuration options
      const format = document.getElementById('format-select').value;
      params.append('format', format);
      
      const printBackground = document.getElementById('print-background').checked;
      params.append('printBackground', printBackground);
      
      const marginTop = document.getElementById('margin-top').value.trim();
      const marginRight = document.getElementById('margin-right').value.trim();
      const marginBottom = document.getElementById('margin-bottom').value.trim();
      const marginLeft = document.getElementById('margin-left').value.trim();
      
      if (marginTop) params.append('marginTop', marginTop);
      if (marginRight) params.append('marginRight', marginRight);
      if (marginBottom) params.append('marginBottom', marginBottom);
      if (marginLeft) params.append('marginLeft', marginLeft);
      
      const baseUrl = window.location.origin;
      const fullUrl = baseUrl + '/?' + params.toString();
      
      document.getElementById('result-url').textContent = fullUrl;
      
      return fullUrl;
    }
    
    // Add event listeners
    document.getElementById('url-input').addEventListener('input', updateUrl);
    document.getElementById('html-input').addEventListener('input', updateUrl);
    document.getElementById('markdown-input').addEventListener('input', updateUrl);
    document.getElementById('base64-input').addEventListener('input', updateUrl);
    document.getElementById('base64-is-markdown').addEventListener('change', updateUrl);
    document.getElementById('format-select').addEventListener('change', updateUrl);
    document.getElementById('print-background').addEventListener('change', updateUrl);
    document.getElementById('margin-top').addEventListener('input', updateUrl);
    document.getElementById('margin-right').addEventListener('input', updateUrl);
    document.getElementById('margin-bottom').addEventListener('input', updateUrl);
    document.getElementById('margin-left').addEventListener('input', updateUrl);
    document.getElementById('filename-input').addEventListener('input', updateUrl);
    
    // Generate PDF
    document.getElementById('generate-btn').addEventListener('click', () => {
      const url = updateUrl();
      window.open(url, '_blank');
    });
    
    // Initialize URL update
    updateUrl();
  </script>
</body>
</html>`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle OPTIONS for CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      const url = new URL(request.url);
      const params = url.searchParams;
      
      // Check if any parameters are passed, return the configuration page if none
      if (params.toString() === '') {
        return new Response(configPage, {
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
          }
        });
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
        return new Response(
          'Please provide either "url", "html", "markdown", or "base64" as a query parameter',
          { status: 400 }
        );
      }

      // Launch browser with the env.MYBROWSER binding
      const browser = await puppeteer.launch(env.MYBROWSER);
      const page = await browser.newPage();

      // Handle different input types
      if (sourceUrl) {
        // Navigate to URL
        await page.goto(sourceUrl, { waitUntil: 'networkidle0' });
      } else if (html) {
        // Set HTML content directly
        await page.setContent(html, { waitUntil: 'networkidle0' });
      } else if (markdown) {
        // Convert Markdown to HTML with styling and add mermaid support
        const htmlContent = `
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
                ${marked.parse(markdown)}
              </div>
            </body>
          </html>`;
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Wait a bit to ensure mermaid diagrams are rendered
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (base64) {
        // Decode base64 to HTML or Markdown
        try {
          const decodedContent = atob(base64);
          if (isMarkdown) {
            // Convert Markdown to HTML with styling and add mermaid support
            const htmlContent = `
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
                    ${marked.parse(decodedContent)}
                  </div>
                </body>
              </html>`;
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            
            // Wait a bit to ensure mermaid diagrams are rendered
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            await page.setContent(decodedContent, { waitUntil: 'networkidle0' });
          }
        } catch (e) {
          await browser.close();
          return new Response('Invalid base64 string', { status: 400 });
        }
      }

      // Generate PDF
      const pdfOptions = {
        format,
        printBackground,
        margin
      };
      
      const pdfBuffer = await page.pdf(pdfOptions);
      await browser.close();

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

      // Return the PDF
      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } catch (error: unknown) {
      console.error('Error generating PDF:', error);
      return new Response(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
  }
} satisfies ExportedHandler<Env>;

// Helper function for CORS
function handleCORS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
