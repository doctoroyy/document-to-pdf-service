# Document to PDF Service

A Cloudflare Worker service that converts HTML and Markdown documents to PDF files. This service provides a simple web interface and API endpoints for converting various document formats to PDF.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/doctoroyy/document-to-pdf-service)

## Features

- Convert HTML documents to PDF
- Convert Markdown documents to PDF
- Support for URL-based conversion
- Support for direct HTML/Markdown input
- Support for Base64 encoded content
- Customizable PDF options (paper format, margins, background printing)
- Clean and intuitive web interface
- CORS support for API access

## API Usage

The service can be accessed via HTTP GET requests with the following query parameters:

- `url`: URL of the webpage to convert
- `html`: Raw HTML content to convert
- `markdown`: Markdown content to convert
- `base64`: Base64 encoded content (HTML or Markdown)
- `isMarkdown`: Set to 'true' if the base64 content is Markdown (default: false)

Optional PDF settings:
- `format`: Paper format (A4, A3, Letter, etc.)
- `printBackground`: Whether to print background graphics (true/false)
- `marginTop`: Top margin (e.g., "1cm")
- `marginRight`: Right margin (e.g., "1cm")
- `marginBottom`: Bottom margin (e.g., "1cm")
- `marginLeft`: Left margin (e.g., "1cm")

## Development

1. Install dependencies:
```bash
pnpm install
```

2. Run locally:
```bash
pnpm run dev
```

3. Deploy to Cloudflare Workers:
```bash
pnpm run deploy
```

## Requirements

- Node.js 18+
- Cloudflare Workers account
- Cloudflare Workers Browser Binding

## License

MIT 
