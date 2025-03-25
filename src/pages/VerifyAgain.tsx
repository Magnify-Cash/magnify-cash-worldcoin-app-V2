
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from "@worldcoin/minikit-js";
import { Shield, User, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { verify } from "@/lib/backendRequests";

const VerifyAgain = () => {
  const navigate = useNavigate();
  const ls_username = localStorage.getItem("ls_username");
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";

  const { data, isLoading, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const [verifying, setVerifying] = useState(false);
  const [currentTierId, setCurrentTierId] = useState<bigint | null>(null);

  const nftInfo = data?.nftInfo || { tokenId: null, tier: null };
  const isOrbVerified = nftInfo?.tier?.verificationStatus?.verification_level === "orb";
  const isDeviceVerified = nftInfo?.tier?.verificationStatus?.verification_level === "device";

  const verificationLevel = {
    tierId: BigInt(2),
    level: "Orb Scan",
    icon: Globe,
    action: "mint-orb-verified-nft",
    upgradeAction: "upgrade-orb-verified-nft",
    verification_level: VerificationLevel.Orb,
  };

  const handleVerify = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      toast({
        title: "Verification Failed",
        description: "Please install World App to verify.",
        variant: "destructive",
      });
      return;
    }
  
    setVerifying(true);
    setCurrentTierId(verificationLevel.tierId);
  
    const verificationStatus = {
      claimAction: verificationLevel.action,
      upgradeAction: verificationLevel.upgradeAction,
      verification_level: verificationLevel.verification_level,
      level: verificationLevel.level,
    };
  
    const verifyPayload: VerifyCommandInput = {
      action: verificationStatus.claimAction || verificationStatus.upgradeAction,
      signal: ls_wallet,
      verification_level: verificationStatus.verification_level as VerificationLevel,
    };
  
    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
      if (finalPayload.status === "error") {
        console.error("Verification failed:", finalPayload);
  
        const errorMessage =
          finalPayload.error_code === "credential_unavailable"
            ? "You are not Orb Verified in the WorldChain App. Please complete Orb verification first."
            : "Something went wrong. Please try again.";
  
        toast({
          title: "Verification Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
  
      // Backend verification call
      const isVerified = await verify(finalPayload, verificationStatus, ls_wallet);
      if (isVerified) {
        toast({
          title: "Verification Successful",
          description: `You are now ${verificationStatus.level} Verified.`,
        });
        refetch();
      }
    } catch (error: any) {
      console.error("Error during verification:", error);
      
      let errorMessage = "Something went wrong while verifying.";
      if (error?.message?.includes("credential_unavailable")) {
        errorMessage = "You are not Orb Verified in the WorldChain App. Please complete Orb verification first.";
      }
  
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  }, [ls_wallet, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Re-Verify" />
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
      <Header title="Re-Verify" />
      <div className="max-w-4xl mx-auto space-y-8 px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-center mb-6">
            <User className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gradient mb-3 text-center break-words">@{ls_username}</h2>
          <p className="text-muted-foreground text-center text-lg">
            {isOrbVerified ? "Currently Orb Verified" : isDeviceVerified ? "Currently Device Verified" : "Not Verified"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gradient mb-2 text-center">Re-Verification</h2>
          <p className="text-muted-foreground text-center text-lg mb-6">
            Re-verify your identity even if you already have an NFT
          </p>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2 text-center">Orb Verification</h3>
              <p className="text-muted-foreground text-center mb-4">
                {isOrbVerified 
                  ? "You're already Orb Verified, but you can re-verify if needed." 
                  : "Upgrade to Orb Verification for full benefits"}
              </p>

              <Button
                className="w-full"
                variant="default"
                disabled={verifying}
                onClick={handleVerify}
              >
                {verifying ? "Verifying..." : "Verify with World ID"}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate("/profile")}
            className="mt-4"
          >
            Back to Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyAgain;
