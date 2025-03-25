
import { BACKEND_URL } from "@/utils/constants";
import { BackendResponse, HttpMethod, RequestParams } from "@/utils/types";
import * as Sentry from "@sentry/react";

async function backendRequest<T>(
  method: HttpMethod,
  path: string,
  paramsOrBody: RequestParams = {}
): Promise<BackendResponse<T>> {
  let url = `${BACKEND_URL}/${path}`;
  
  console.log(`[API Request] ${method} ${path}`, { 
    backendUrl: BACKEND_URL,
    params: paramsOrBody 
  });
  
  Sentry.addBreadcrumb({
    category: 'api',
    message: `${method} ${path}`,
    level: 'info',
    data: {
      url,
      method,
      params: method === "GET" ? paramsOrBody : undefined,
      hasBody: method === "POST" ? true : false
    }
  });

  if (method === "GET" && Object.keys(paramsOrBody).length) {
    const queryParams = new URLSearchParams();
    Object.entries(paramsOrBody).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    url += `?${queryParams.toString()}`;
  }

  const options: RequestInit = {
    method,
    ...(method === "POST" ? { 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paramsOrBody) 
    } : {}),
  };

  try {
    const response = await fetch(url, options);
    
    // Log response status and headers
    console.log(`[API Response] ${method} ${path}`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()])
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Error] ${method} ${path}`, {
        status: response.status,
        statusText: response.statusText,
        responseText: errorText
      });
      
      Sentry.captureMessage(`API Error: ${response.status} ${response.statusText}`, "error");
      
      throw new Error(`API Error: ${response.status} - ${errorText || "Unknown error"}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text();
      console.error(`[API Error] ${method} ${path}: Invalid content type`, {
        contentType,
        responseText: responseText.substring(0, 100) + (responseText.length > 100 ? '...' : '')
      });
      
      Sentry.captureMessage(`API Error: Invalid content type: ${contentType}`, "error");
      
      throw new Error(`API Error: Invalid content type: ${contentType}, Response: ${responseText.substring(0, 100)}`);
    }
    
    const result: BackendResponse<T> = await response.json();
    
    console.log(`[API Success] ${method} ${path}`, {
      status: result.status,
      message: result.message,
      hasData: !!result.data
    });

    if (result.status < 200 || result.status >= 300) {
      console.error(`[API Error] ${method} ${path}`, {
        status: result.status,
        message: result.message
      });
      
      Sentry.captureMessage(`API Error: ${result.status} - ${result.message || "Unknown error"}`, "error");
      
      throw new Error(`API Error: ${result.status} - ${result?.message || "Unknown error"}`);
    }

    return result;
  } catch (error) {
    console.error(`[API Error] ${method} ${path}`, error);
    
    Sentry.captureException(error, {
      tags: {
        api: path,
        method
      },
      extra: {
        url,
        params: method === "GET" ? paramsOrBody : undefined,
        body: method === "POST" ? paramsOrBody : undefined
      }
    });
    
    throw error;
  }
}

export default backendRequest;
