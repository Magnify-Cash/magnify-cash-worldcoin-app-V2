import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useDemoData } from "@/providers/DemoDataProvider";
import { Button } from "@/components/ui/button";
import { Minikit } from "@minikit/safe-apps";

const Welcome = () => {
  const navigate = useNavigate();
  const { login } = useDemoData();
  const isMobile = useIsMobile();
  const [error, setError] = useState<string | null>(null);
  const [isClicked, setIsClicked] = useState(false);

  // Handle wallet connection
  const handleConnect = async () => {
    setIsClicked(true);
    setError(null);
    try {
      const result = await Minikit.walletAuth();
      if ('status' in result && result.status === 'success' && 'payload' in result) {
        const wallet = (result.payload as any).address; // Type assertion to handle the address
        login(wallet);
        navigate("/guide");
      } else {
        setError("Failed to connect wallet.");
        console.error("Wallet connection failed", result);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet.");
      console.error("Wallet connection error", e);
    } finally {
      setIsClicked(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-4xl font-bold mb-8">Welcome to Magnify World</h1>
      <p className="text-gray-600 mb-4">Connect your wallet to continue.</p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Button onClick={handleConnect} disabled={isClicked}>
        {isClicked ? "Connecting..." : "Connect Wallet"}
      </Button>
      {isMobile && (
        <p className="text-sm text-gray-500 mt-4">
          Please use a wallet that supports Safe Apps.
        </p>
      )}
    </div>
  );
};

export default Welcome;
