
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

type RequestLoanResponse = {
  success: boolean;
  message: string;
};

export const useRequestLoan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<RequestLoanResponse | null>(null);
  const navigate = useNavigate();

  const requestLoan = async (): Promise<RequestLoanResponse> => {
    setIsLoading(true);

    try {
      // Mock successful response for demo
      const mockResponse: RequestLoanResponse = {
        success: true,
        message: "Loan request submitted successfully!",
      };

      setResponse(mockResponse);
      toast({
        title: "Success!",
        description: "Your loan request has been submitted successfully.",
      });
      
      // Redirect to Loan page after successful request
      setTimeout(() => {
        navigate("/loan");
      }, 1500);
      
      return mockResponse;
    } catch (error) {
      console.error("Error requesting loan:", error);
      const errorResponse: RequestLoanResponse = {
        success: false,
        message: "Failed to request loan. Please try again.",
      };
      
      setResponse(errorResponse);
      toast({
        title: "Error",
        description: "Failed to request loan. Please try again.",
        variant: "destructive",
      });
      
      return errorResponse;
    } finally {
      setIsLoading(false);
    }
  };

  return { requestLoan, isLoading, response };
};
