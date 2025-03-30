
import { BACKEND_URL } from "@/utils/constants";
import { BackendResponse, HttpMethod, RequestParams } from "@/utils/types";

async function backendRequest<T>(
  method: HttpMethod,
  path: string,
  paramsOrBody: RequestParams = {},
  options: { retries?: number; retryDelay?: number } = {}
): Promise<BackendResponse<T>> {
  const { retries = 0, retryDelay = 1000 } = options;
  let lastError: Error | null = null;
  let attempt = 0;
  
  while (attempt <= retries) {
    try {
      let url = `${BACKEND_URL}/${path}`;

      if (method === "GET" && Object.keys(paramsOrBody).length) {
        const queryParams = new URLSearchParams();
        Object.entries(paramsOrBody).forEach(([key, value]) => {
          queryParams.append(key, String(value));
        });
        url += `?${queryParams.toString()}`;
      }

      const requestOptions: RequestInit = {
        method,
        ...(method === "POST" ? { 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paramsOrBody) 
        } : {}),
      };

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const result: BackendResponse<T> = await response.json();

      if (result.status < 200 || result.status >= 300) {
        throw new Error(`API Error: ${response.status} - ${result?.message || "Unknown error"}`);
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;
      
      if (attempt <= retries) {
        console.warn(`Request to ${path} failed (attempt ${attempt}/${retries + 1}). Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error(`All ${retries + 1} attempts to ${path} failed`);
}

export default backendRequest;
