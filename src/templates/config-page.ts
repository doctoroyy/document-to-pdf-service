// HTML Configuration Page
export const configPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Document to PDF Service</title>
  <style>
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
      padding: 15px;
      font-size: 16px;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 25px;
      color: #2c3e50;
      font-size: 1.8rem;
    }
    
    .tabs {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    
    .tab {
      padding: 8px 15px;
      cursor: pointer;
      margin-right: 5px;
      margin-bottom: 5px;
      border: 1px solid #ddd;
      border-bottom: none;
      border-radius: 5px 5px 0 0;
      background-color: #f8f9fa;
      font-size: 0.9rem;
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
      font-size: 16px; /* Prevent zoom on focus in iOS */
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
      font-size: 1.2rem;
    }
    
    button {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      width: 100%;
      max-width: 300px;
      touch-action: manipulation; /* Improves touch responsiveness */
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
      font-size: 0.9rem;
      word-break: break-all;
      white-space: pre-wrap;
    }
    
    .input-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .input-row .form-group {
      flex: 1 0 calc(50% - 10px);
      min-width: 120px;
    }
    
    /* Mobile-specific styles */
    @media (max-width: 600px) {
      .tabs {
        justify-content: center;
      }
      
      .tab {
        flex: 1 0 calc(50% - 10px);
        text-align: center;
        margin-right: 5px;
      }
      
      .input-row .form-group {
        flex: 1 0 100%;
      }
      
      h1 {
        font-size: 1.5rem;
      }
      
      button {
        width: 100%;
      }
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
    // Prevent double-tap zoom on iOS
    document.addEventListener('touchend', function(event) {
      if (event.target.tagName === 'BUTTON' || event.target.tagName === 'SELECT') {
        event.preventDefault();
      }
    }, false);
    
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