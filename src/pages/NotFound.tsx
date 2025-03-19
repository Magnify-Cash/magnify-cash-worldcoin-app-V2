import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-gray-500 mt-2">Oops! The page you're looking for doesn't exist.</p>
      
      <Button className="mt-6" onClick={() => navigate("/")}>
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;
