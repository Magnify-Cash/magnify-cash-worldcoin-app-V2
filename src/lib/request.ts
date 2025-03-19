import { BACKEND_URL } from "@/utils/constants";
import { BackendResponse, HttpMethod, RequestParams } from "@/utils/types";

async function backendRequest<T>(
  method: HttpMethod,
  path: string,
  paramsOrBody: RequestParams = {}
): Promise<BackendResponse<T>> {
  let url = `${BACKEND_URL}/${path}`;

  if (method === "GET" && Object.keys(paramsOrBody).length) {
    const queryParams = new URLSearchParams();
    Object.entries(paramsOrBody).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    url += `?${queryParams.toString()}`;
  }

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(method === "POST" ? { body: JSON.stringify(paramsOrBody) } : {}),
  };

  const response = await fetch(url, options);
  const result: BackendResponse<T> = await response.json();

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`API Error: ${response.status} - ${result?.message || "Unknown error"}`);
  }

  return result;
}

export default backendRequest;
