
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h1 className="text-4xl font-bold mb-4 text-gradient">404 - Page Not Found</h1>
      <p className="text-muted-foreground text-center mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate("/")} className="glass-button">
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;
