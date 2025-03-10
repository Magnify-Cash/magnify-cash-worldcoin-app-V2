import { BACKEND_URL } from "@/utils/constants";

interface RequestParams {
  [key: string]: string | number | boolean;
}

type HttpMethod = "GET" | "POST";

async function backendRequest<T>(method: HttpMethod, path: string, paramsOrBody: RequestParams = {}): Promise<T> {
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
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${await response.text()}`);
  }

  return response.json();
}

export default backendRequest;
