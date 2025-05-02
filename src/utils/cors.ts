// Common CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

/**
 * Create a response with CORS headers
 * @param options Configuration options
 * @param options.response Optional existing response to add CORS headers to
 * @param options.status HTTP status code for new responses (default: 204 for preflight, 200 otherwise)
 * @param options.body Response body (default: null)
 * @returns A new Response with CORS headers
 */
export function createCORSResponse(options: {
  response?: Response;
  status?: number;
  body?: BodyInit | null;
} = {}): Response {
  const { response, status, body = null } = options;
  
  // If an existing response is provided, add CORS headers to it
  if (response) {
    const headers = new Headers(response.headers);
    
    // Add all CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  
  // Create a new response with CORS headers (used for preflight or new responses)
  return new Response(body, {
    status: status ?? 204, // Default to 204 No Content
    headers: corsHeaders
  });
}

// For backward compatibility
export const createCORSPreflightResponse = () => createCORSResponse();
export const addCORSHeaders = (response: Response) => createCORSResponse({ response }); 