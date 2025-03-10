import backendRequest from "@/lib/request";

export const getETHBalance = async (wallet: string): Promise<number> => {
  const response = await backendRequest<{ balance: string }>("GET", "getETHBalance", { wallet });
  if (!response?.balance) throw new Error("Failed to fetch ETH balance");
  return Number(response.balance);
};

export const getTokenBalance = async (wallet: string, token: string): Promise<number> => {
  const response = await backendRequest<{ balance: string }>("GET", "getTokenBalance", { wallet, token });
  if (!response?.balance) throw new Error("Failed to fetch token balance");
  return Number(response.balance);
};