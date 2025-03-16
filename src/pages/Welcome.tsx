
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MiniKit } from "@worldcoin/minikit-js";
import { ArrowRight, Shield } from "lucide-react";
import { toast } from "sonner";

const Welcome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    const wallet_address = localStorage.getItem("ls_wallet_address");
    const username = localStorage.getItem("ls_username");
    if (username && wallet_address) {
      navigate("/wallet");
      return;
    }
    try {
      setLoading(true);
      console.log("Initiating wallet authentication...");
      const nonce = crypto.randomUUID().replace(/-/g, "");
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        statement: "Sign in to Magnify Cash to manage your loans.",
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      });
      if (finalPayload && finalPayload.walletAddress) {
        const user = await MiniKit.getUserByAddress(finalPayload.walletAddress);
        localStorage.setItem("ls_wallet_address", user.walletAddress);
        localStorage.setItem("ls_username", user.username);
        toast.success("Successfully signed in!");
        console.log("ADDRESS:", user.walletAddress);
        console.log("USERNAME:", user.username);
        setLoading(false);
        navigate("/wallet");
      } else {
        setLoading(false);
        toast.error("Failed to retrieve wallet address.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Authentication failed:", error);
      toast.error("Failed to sign in. Please try again.");
    }
  };

  const handleLenderSignUp = () => {
    navigate("/lending");
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
              {loading ? "Connecting..." : "Get a Loan"}
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleLenderSignUp}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-200 bg-[#8B5CF6] text-white hover:bg-[#7E69AB] transition-all duration-300 font-medium w-full sm:w-auto min-h-[48px] text-base"
            >
              Become a Lender
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
