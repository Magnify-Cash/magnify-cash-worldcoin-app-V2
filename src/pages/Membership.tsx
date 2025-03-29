
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { MiniKit } from "@worldcoin/minikit-js";
import { Shield, Crown, Zap, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

// Define the membership tiers
const membershipTiers = [
  {
    id: "bronze",
    name: "Bronze Membership",
    icon: Shield,
    color: "bg-amber-500",
    description: "Basic member benefits with priority loan processing",
    benefits: ["Priority loan processing", "5% increased loan limits", "Early access to new features"],
    price: "Free with Orb Verification",
    mintAction: "mint-bronze-membership",
  },
  {
    id: "silver",
    name: "Silver Membership",
    icon: Star,
    color: "bg-gray-400",
    description: "Enhanced benefits with higher loan limits and reduced interest",
    benefits: ["15% increased loan limits", "0.25% reduced interest rates", "Dedicated support channel", "Priority loan processing"],
    price: "Coming Soon",
    disabled: true,
    mintAction: "mint-silver-membership",
  },
  {
    id: "gold",
    name: "Gold Membership",
    icon: Crown,
    color: "bg-yellow-500",
    description: "Premium benefits with maximum loan amounts and preferred rates",
    benefits: ["30% increased loan limits", "0.5% reduced interest rates", "Priority verification", "VIP support access", "Exclusive investment opportunities"],
    price: "Coming Soon",
    disabled: true,
    mintAction: "mint-gold-membership",
  }
];

const Membership = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const ls_wallet = localStorage.getItem("ls_wallet_address") as `0x${string}` || "";
  const { data, isLoading, refetch } = useMagnifyWorld(ls_wallet);
  const [mintingTier, setMintingTier] = useState<string | null>(null);
  
  // Check if the user is Orb verified
  const isOrbVerified = data?.nftInfo?.tier?.verificationStatus?.verification_level === "orb";
  const hasActiveLoan = data?.loan?.[1]?.isActive === true;

  const handleMintMembership = async (tierId: string, mintAction: string) => {
    if (!isOrbVerified) {
      toast({
        title: "Verification Required",
        description: "You need to be Orb verified to mint a membership NFT.",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }

    if (hasActiveLoan) {
      toast({
        title: "Active Loan Detected",
        description: "You cannot mint a membership while having an active loan. Please repay your loan first.",
        variant: "destructive",
      });
      return;
    }

    setMintingTier(tierId);
    
    try {
      // This is a placeholder for the actual minting functionality
      // In a real implementation, this would interact with the smart contract
      toast({
        title: "Feature Coming Soon",
        description: "NFT Membership minting will be available in the next update.",
      });
      
      // Simulating a delay
      setTimeout(() => {
        setMintingTier(null);
      }, 2000);
      
    } catch (error) {
      console.error("Error minting membership:", error);
      toast({
        title: "Minting Failed",
        description: "There was an error minting your membership NFT. Please try again.",
        variant: "destructive",
      });
      setMintingTier(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="NFT Membership" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="flex items-center justify-center gap-2">
            <div className="dot-spinner">
              <div className="dot bg-[#1A1E8E]"></div>
              <div className="dot bg-[#4A3A9A]"></div>
              <div className="dot bg-[#7A2F8A]"></div>
              <div className="dot bg-[#A11F75]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="NFT Membership" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text">
            Exclusive NFT Memberships
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mint your membership NFT to unlock exclusive benefits and enhanced loan privileges on Magnify Cash.
          </p>
        </div>

        {!isOrbVerified && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8"
          >
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-amber-800">Verification Required</h3>
                <p className="text-amber-700 text-sm mt-1">
                  You need to be Orb verified to mint a membership NFT. Verify your identity to unlock membership benefits.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                  onClick={() => navigate("/profile")}
                >
                  Get Verified <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {membershipTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card className={`p-6 h-full border-2 ${tier.id === 'bronze' ? 'border-amber-300' : tier.id === 'silver' ? 'border-gray-300' : 'border-yellow-400'} hover:shadow-lg transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-full ${tier.color} flex items-center justify-center mb-4 mx-auto`}>
                  <tier.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">{tier.name}</h3>
                <p className="text-gray-600 text-center text-sm mb-4">{tier.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto">
                  <p className="text-center font-medium mb-3">{tier.price}</p>
                  <Button 
                    className="w-full" 
                    variant={tier.id === 'bronze' ? 'default' : 'outline'}
                    disabled={tier.disabled || mintingTier === tier.id || (!isOrbVerified && tier.id === 'bronze')}
                    onClick={() => handleMintMembership(tier.id, tier.mintAction)}
                  >
                    {mintingTier === tier.id ? (
                      <>Minting...</>
                    ) : tier.disabled ? (
                      <>Coming Soon</>
                    ) : (
                      <>Mint Membership</>
                    )}
                  </Button>
                </div>
              </Card>
              
              {tier.id === 'bronze' && (
                <div className="absolute -top-3 -right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Available Now
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">How NFT Memberships Work</h3>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="font-medium">Get Orb Verified</p>
                <p className="text-gray-600 text-sm">Complete World ID Orb verification to become eligible for NFT memberships.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <p className="font-medium">Mint Your Membership NFT</p>
                <p className="text-gray-600 text-sm">Select your preferred tier and mint your NFT membership token.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <p className="font-medium">Enjoy Exclusive Benefits</p>
                <p className="text-gray-600 text-sm">Access higher loan limits, reduced interest rates, and other premium features.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Membership;
