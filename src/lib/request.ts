
import { BACKEND_URL } from "@/utils/constants";
import { BackendResponse, HttpMethod, RequestParams } from "@/utils/types";

async function backendRequest<T>(
  method: HttpMethod,
  path: string,
  paramsOrBody: RequestParams = {},
  options: { retries?: number; retryDelay?: number } = {}
): Promise<BackendResponse<T>> {
  const { retries = 2, retryDelay = 1000 } = options;
  let lastError: Error | null = null;
  let attempt = 0;
  
  while (attempt <= retries) {
    try {
      // Check if BACKEND_URL is defined and not empty
      if (!BACKEND_URL) {
        console.error("BACKEND_URL is not defined. Check your environment variables.");
        throw new Error("Backend URL is not configured properly");
      }
      
      // Use correct URL format, ensuring no double slashes between base URL and path
      let url = `${BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL}/${path}`;

      if (method === "GET" && Object.keys(paramsOrBody).length) {
        const queryParams = new URLSearchParams();
        Object.entries(paramsOrBody).forEach(([key, value]) => {
          queryParams.append(key, String(value));
        });
        url += `?${queryParams.toString()}`;
      }

      console.log(`Making ${method} request to: ${url}`);

      const requestOptions: RequestInit = {
        method,
        ...(method === "POST" ? { 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paramsOrBody) 
        } : {}),
      };

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
      }
      
      // Log the content type to help diagnose response parsing issues
      const contentType = response.headers.get('content-type');
      console.log(`Response content type: ${contentType}`);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`Expected JSON response but got ${contentType}`);
        // Try to get the text response for debugging
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse.substring(0, 200) + '...');
        throw new Error(`API returned non-JSON response with content type: ${contentType}`);
      }
      
      const result: BackendResponse<T> = await response.json();

      if (result.status < 200 || result.status >= 300) {
        throw new Error(`API Error: ${response.status} - ${result?.message || "Unknown error"}`);
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;
      
      console.error(`Request to ${path} failed (attempt ${attempt}/${retries + 1}):`, lastError);
      
      if (attempt <= retries) {
        console.warn(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error(`All ${retries + 1} attempts to ${path} failed`);
}

export default backendRequest;
