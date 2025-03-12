
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MiniKit } from "@worldcoin/minikit-js";
import { ArrowRight, Shield } from "lucide-react";
import { toast } from "sonner";
import { useDemoData } from "@/providers/DemoDataProvider";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";

const Welcome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login, updateUSDCBalance } = useDemoData();

  // Generate a random USDC.e amount between 15 and 100
  const generateRandomUSDCeAmount = () => {
    return Number((Math.random() * (100 - 15) + 15).toFixed(2));
  };

  const handleSignIn = async () => {
    const wallet_address = localStorage.getItem("ls_wallet_address");
    const username = localStorage.getItem("ls_username");
    if (username && wallet_address) {
      // Update the demo data with the existing session
      login(wallet_address);
      navigate("/wallet");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Initiating wallet authentication...");
      
      if (!MiniKit.isInstalled()) {
        toast.error("Please install World App to connect your wallet.");
        setLoading(false);
        return;
      }
      
      const nonce = crypto.randomUUID().replace(/-/g, "");
      
      // Using the correct MiniKit API and properly accessing the response object
      const result = await MiniKit.commands.walletAuth({
        nonce,
        statement: "Sign in to Magnify Cash to manage your loans.",
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      });
      
      // Based on MiniKit's WalletAuthPayload documentation, access the correct property
      if (result && result.walletAddress) {
        // Get user wallet address - this exists in the result object
        const walletAddress = result.walletAddress;
        const username = `world_${walletAddress.substring(2, 8)}`;
        
        // Generate random USDC.e balance
        const randomBalance = generateRandomUSDCeAmount();
        
        // Store in localStorage to maintain session
        localStorage.setItem("ls_wallet_address", walletAddress);
        localStorage.setItem("ls_username", username);
        
        // Update the demo data with the login and balance
        login(walletAddress);
        updateUSDCBalance(randomBalance);
        
        toast.success("Successfully signed in!");
        console.log("WORLD APP ADDRESS:", walletAddress);
        console.log("USERNAME:", username);
        console.log("USDC.e BALANCE:", randomBalance);
        
        navigate("/wallet");
      } else {
        toast.error("Failed to retrieve wallet address.");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDummySignIn = async () => {
    try {
      setLoading(true);
      
      // Generate a random demo wallet address
      const demoWalletAddress = "0x" + Array(40).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Set the demo username
      const demoUsername = "demo_user_" + Math.floor(Math.random() * 1000);
      
      // Generate random USDC.e balance
      const randomBalance = generateRandomUSDCeAmount();
      
      // Store in localStorage to maintain session
      localStorage.setItem("ls_wallet_address", demoWalletAddress);
      localStorage.setItem("ls_username", demoUsername);
      
      // Update the demo data with the login and balance
      login(demoWalletAddress);
      updateUSDCBalance(randomBalance);
      
      toast.success("Successfully signed in with demo wallet!");
      console.log("DEMO ADDRESS:", demoWalletAddress);
      console.log("DEMO USERNAME:", demoUsername);
      console.log("DEMO USDC.e BALANCE:", randomBalance);
      
      navigate("/wallet");
    } catch (error) {
      console.error("Demo authentication failed:", error);
      toast.error("Failed to sign in with demo wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Mobile Optimized */}
      <nav className="px-3 sm:px-6 py-4 flex justify-between items-center border-b border-gray-100 safe-area-inset-top">
        <div className="flex items-center gap-2">
          <img
            alt="Magnify Cash Logo"
            className="w-8 h-8 rounded-[20%]"
            src="/lovable-uploads/a58f7265-4f91-4fe4-9870-a88ac9aadba9.jpg"
          />
          <div className="text-gray-900 text-lg sm:text-2xl font-medium truncate">
            Magnify Cash
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <div className="container mx-auto px-3 sm:px-6 pt-8 sm:pt-20 pb-12 sm:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text animate-gradient leading-tight">
            Get a loan just by being you.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-12 max-w-[90%] sm:max-w-2xl mx-auto font-medium">
            Get instant loans backed by your World ID. No collateral needed, just
            your verified digital presence.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-16 px-3 sm:px-4">
            <button
              disabled={loading}
              onClick={handleSignIn}
              className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] text-base"
            >
              {loading ? "Connecting..." : "Connect with World App"}
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              disabled={loading}
              onClick={handleDummySignIn}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-200 text-gray-600 transition-all duration-300 font-medium w-full sm:w-auto min-h-[48px] text-base hover:bg-gray-50"
            >
              Use Demo Wallet
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Trust Badge - Mobile Optimized */}
          <div className="flex items-center justify-center gap-2 text-gray-600 px-3 sm:px-4 text-center">
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              Verified by World ID. Settled on World Chain. Powered by $MAG.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
