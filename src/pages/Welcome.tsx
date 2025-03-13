
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IDKitWidget } from "@worldcoin/minikit-react";
import { Logo } from "../components/ui/logo";

export const Welcome = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has a wallet address in local storage
    const savedWallet = localStorage.getItem("ls_wallet_address");
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
    setIsLoading(false);
  }, []);

  // Handle form submission
  const handleConnectWallet = (address: string) => {
    localStorage.setItem("ls_wallet_address", address);
    setWalletAddress(address);
    navigate("/wallet");
  };

  const handleOnboard = () => {
    if (walletAddress) {
      navigate("/wallet");
    } else {
      // Use a demo wallet address
      const demoWalletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
      localStorage.setItem("ls_wallet_address", demoWalletAddress);
      navigate("/wallet");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="dot-spinner">
          <div className="dot bg-[#1A1E8E]"></div>
          <div className="dot bg-[#4A3A9A]"></div>
          <div className="dot bg-[#7A2F8A]"></div>
          <div className="dot bg-[#A11F75]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <div className="flex flex-1 flex-col items-center justify-center py-12 sm:px-4 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <Logo />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome to <span className="text-primary-black">Magnify Cash</span>
            </h2>
            <p className="mt-2 text-gray-600">
              Loans Simplified, Interest Minimized
            </p>
          </div>
          <div className="bg-white py-8 px-4 shadow-lg rounded-xl sm:px-10">
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Button
                  className="w-full justify-center bg-black text-white hover:bg-black/90"
                  size="lg"
                  onClick={handleOnboard}
                >
                  Demo Connect Wallet
                </Button>
                <div className="flex items-center w-full">
                  <div className="flex-grow h-px bg-gray-200" />
                  <span className="px-3 text-gray-500 text-sm">or</span>
                  <div className="flex-grow h-px bg-gray-200" />
                </div>

                <div className="w-full">
                  <IDKitWidget
                    app_id="app_staging_5eb6ca12cb11e9c66e61ad471a7ffa30"
                    action="loan-verify"
                    onSuccess={(proof) => {
                      console.log("Proof received", proof);
                      handleOnboard();
                    }}
                    handleVerify={(proof) => {
                      console.log("Verifying proof", proof);
                      return Promise.resolve(true);
                    }}
                    signal="demo_wallet"
                    credential_types={["orb", "device"]}
                  >
                    {({ open }) => (
                      <Button
                        onClick={open}
                        className="w-full justify-center bg-lime-500 hover:bg-lime-600 text-white"
                        size="lg"
                      >
                        <img src="/lovable-uploads/f590c0ed-415e-4ed0-8f6b-631288f14028.png" alt="WorldID" className="w-5 h-5 mr-2" />
                        Verify with World ID
                      </Button>
                    )}
                  </IDKitWidget>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
