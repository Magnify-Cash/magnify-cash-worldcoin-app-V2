
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header title="Page Not Found" showBack={false} />
      
      <div className="flex-1 flex flex-col items-center px-4 text-center mt-16">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">404</h1>
          <p className="text-xl font-medium text-gray-700 mb-2">Oops! Page not found</p>
          <p className="text-gray-500 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Button 
          onClick={() => navigate("/")}
          className="glass-button flex items-center justify-center gap-2 min-h-[48px] text-base w-full max-w-xs"
        >
          <Home className="w-5 h-5" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
