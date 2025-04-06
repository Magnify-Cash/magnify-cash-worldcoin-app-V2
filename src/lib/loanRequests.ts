
import backendRequest from "./request";
import { Loan } from "@/types/supabase/loan";

export const getLoanById = async (id: number): Promise<Loan | null> => {
  try {
    const response = await backendRequest<Loan>(
      "GET",
      `loans/${id}`,
      {},
      { retries: 2 }
    );
    
    if (response.status >= 200 && response.status < 300 && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching loan:", error);
    return null;
  }
};

export const getAllLoans = async (): Promise<Loan[]> => {
  try {
    const response = await backendRequest<Loan[]>(
      "GET",
      "loans",
      {},
      { retries: 2 }
    );
    
    if (response.status >= 200 && response.status < 300 && response.data) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching loans:", error);
    return [];
  }
};
