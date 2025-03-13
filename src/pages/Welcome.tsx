
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMiniKitAuth } from "@worldcoin/minikit-react";
import { useNavigate } from "react-router-dom";
import { useDemoData } from "@/providers/DemoDataProvider";
import { toast } from "@/components/ui/use-toast";

const Welcome = () => {
  const { worldAuthAction, authData } = useMiniKitAuth(false);
  const navigate = useNavigate();
  const { login } = useDemoData();

  const handleConnect = useCallback(async () => {
    worldAuthAction({
      appId: "app_staging_5bf75ef908e5358fe9d3f4704e79f0ae",
      oauthProvider: "auth0",
      token: true,
      walletAuth: true,
    });
  }, [worldAuthAction]);

  useEffect(() => {
    // If authData exists and has an address, automatically log in
    if (authData?.walletAuthPayload && 'address' in authData.walletAuthPayload) {
      const address = authData.walletAuthPayload.address as string;
      if (address) {
        login(address);
        navigate("/wallet");
        toast({
          title: "Wallet Connected",
          description: `Wallet ${address.slice(0, 6)}...${address.slice(-4)} connected successfully!`,
        });
      }
    }
  }, [authData, login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="text-center space-y-6">
        <img
          src="/lovable-uploads/a58f7265-4f91-4fe4-9870-a88ac9aadba9.jpg"
          alt="Magnify Cash"
          className="w-32 h-32 mx-auto"
        />
        <h1 className="text-3xl font-bold">Welcome to Magnify Cash</h1>
        <p className="text-gray-600">Connect your wallet to get started</p>
        <Button
          className="bg-black hover:bg-black/90 text-white px-8 py-4 rounded-lg text-lg"
          onClick={handleConnect}
        >
          Connect Wallet
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
