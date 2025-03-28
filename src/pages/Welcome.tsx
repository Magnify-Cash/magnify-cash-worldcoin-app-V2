
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MiniKit, MiniAppWalletAuthPayload } from "@worldcoin/minikit-js";
import { ArrowRight, Shield, Wallet, Gem } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type ExtendedWalletAuthPayload = MiniAppWalletAuthPayload & {
  address: string;
};

const Welcome = () => {
  const navigate = useNavigate();
  const toast = useToast();
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
      const nonce = crypto.randomUUID().replace(/-/g, "");
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        statement: "Sign in to Magnify Cash to manage your loans.",
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      });

      const extendedPayload = finalPayload as ExtendedWalletAuthPayload;

      if (extendedPayload && extendedPayload.address) {
        const user = await MiniKit.getUserByAddress(extendedPayload.address);
        localStorage.setItem("ls_wallet_address", user.walletAddress);
        localStorage.setItem("ls_username", user.username);

        toast.toast({
          title: "Successfully signed in!",
          description: `Welcome back, ${user.username}!`,
        });
        setLoading(false);
        navigate("/wallet");
      } else {
        setLoading(false);
        toast.toast({
          title: "Error",
          description: "Failed to retrieve wallet address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Authentication failed:", error);
      toast.toast({
        title: "Error",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      });
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

      {/* Enhanced Hero Section - Mobile Optimized */}
      <div className="container mx-auto px-3 sm:px-6 pt-8 sm:pt-16 pb-12 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Left Content - Text and CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text animate-gradient leading-tight">
                Get a loan just by being you.
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-10 max-w-[90%] sm:max-w-2xl mx-auto lg:mx-0 font-medium">
                Get instant loans backed by your World ID. No collateral needed, just
                your verified digital presence. Participate in our ecosystem as a borrower or lender.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-10">
                <Button
                  disabled={loading}
                  onClick={handleSignIn}
                  className="flex items-center justify-center gap-2 min-h-[48px] text-base py-6 px-8 font-semibold bg-gradient-to-r from-[#6456F1] to-[#8F56F1] hover:from-[#5646E1] hover:to-[#7F46E1] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Wallet className="w-5 h-5" />
                  {loading ? "Connecting..." : "Get a Loan"}
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <Button
                  onClick={handleLenderSignUp}
                  className="flex items-center justify-center gap-2 py-6 px-8 rounded-xl border border-[#6456F1] text-[#6456F1] hover:bg-[#6456F1] hover:text-white transition-all duration-300 font-semibold min-h-[48px] text-base"
                >
                  <Gem className="w-5 h-5" />
                  Become a Lender
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Trust Badge - Enhanced */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 px-3 sm:px-0 text-center lg:text-left bg-gray-50 lg:bg-transparent p-3 lg:p-0 rounded-xl">
                <Shield className="w-5 h-5 flex-shrink-0 text-[#6456F1]" />
                <span className="text-sm font-medium">
                  Verified by World ID. Settled on World Chain. Powered by $MAG.
                </span>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Shield className="w-5 h-5 text-[#6456F1]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Identity-Based Lending</h3>
                    <p className="text-gray-600 text-sm">Get approved for loans based on your verified World ID, no collateral required.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Gem className="w-5 h-5 text-[#6456F1]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Earn Interest</h3>
                    <p className="text-gray-600 text-sm">Provide liquidity to lending pools and earn competitive interest rates.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Wallet className="w-5 h-5 text-[#6456F1]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Simple & Secure</h3>
                    <p className="text-gray-600 text-sm">Our smart contracts ensure safe transactions and automatic management.</p>
                  </div>
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
