
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from "@worldcoin/minikit-js";
import { DollarSign, Shield, User, FileText, Pi, AlertTriangle, Bell, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { useMagnifyWorld, Tier } from "@/hooks/useMagnifyWorld";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/utils/constants";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  // hooks
  const navigate = useNavigate();
  const ls_username = localStorage.getItem("ls_username");
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const [verifying, setVerifying] = useState(false);
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);

  // state
  const nftInfo = data?.nftInfo || { tokenId: null, tier: null };
  const hasActiveLoan = data?.loan?.[1]?.isActive === true;
  const loan = data?.loan;

  // Check if the user is verified by ORB device
  const isOrbVerified = nftInfo?.tier?.verificationStatus?.verification_level === "orb";
  
  // Verification levels
  const verificationLevels = {
    orb: {
      tierId: BigInt(2),
      level: "Orb Scan",
      icon: Globe,
      action: "mint-orb-verified-nft",
      upgradeAction: "upgrade-orb-verified-nft",
      verification_level: VerificationLevel.Orb,
    },
  };

  // Handle verification process
  const handleVerify = useCallback(async (tier: typeof verificationLevels.orb) => {
    if (!MiniKit.isInstalled()) {
      toast({
        title: "Verification Failed",
        description: "Please install World App to verify.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    setCurrentTier(tier as unknown as Tier);

    const verificationStatus = {
      claimAction: tier.action,
      upgradeAction: tier.upgradeAction,
      verification_level: tier.verification_level,
      level: tier.level,
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

        if (finalPayload.error_code === "credential_unavailable") {
          toast({
            title: "Verification Failed",
            description: "You are not Orb Verified in the WorldChain App. Please complete Orb verification first.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Verification Failed",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
        setVerifying(false);
        return;
      }

      // Send proof to backend
      const response = await fetch(`${BACKEND_URL}/verify`, {
        method: "POST",
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: verificationStatus.claimAction || verificationStatus.upgradeAction,
          signal: ls_wallet,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast({
          title: "Verification Successful",
          description: `You are now ${verificationStatus.level} Verified.`,
        });
        refetch();
      } else {
        toast({
          title: "Backend Error",
          description: result.message || "Something went wrong.",
          variant: "destructive",
        });
        console.error("Backend verification failed:", result);
      }
    } catch (error: any) {
      console.error("Error during verification:", error);

      let errorMessage = "Something went wrong while verifying.";

      if (error?.error_code === "credential_unavailable") {
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
  }, [ls_wallet, refetch, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Profile" />
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

  if (!isLoading && data) {
    const nftInfo = data?.nftInfo || { tokenId: null, tier: null };
    const userTierId = nftInfo?.tier?.tierId || BigInt(0);
    const isDeviceVerified = nftInfo?.tier?.verificationStatus?.verification_level === "device";

    return (
      <div className="min-h-screen bg-background">
        <Header title="Profile" />
        <div className="max-w-4xl mx-auto space-y-8 px-4 py-6">
          {/* User Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center mb-6">
              <User className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gradient mb-3 text-center break-words">@{ls_username}</h2>
            {isOrbVerified ? (
              <p className="text-muted-foreground text-center text-lg">
                {nftInfo?.tier.verificationStatus.level} Verified User
              </p>
            ) : (
              <p className="text-muted-foreground text-center text-lg">Unverified</p>
            )}
          </motion.div>

          {/* Verification Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gradient mb-2 text-center">Verification Level</h2>
            <p className="text-muted-foreground text-center text-lg mb-6">
              {isDeviceVerified || nftInfo.tokenId === null ? "Unverified" : `Currently: ${nftInfo.tier?.verificationStatus.level.charAt(0).toUpperCase() + nftInfo.tier?.verificationStatus.level.slice(1).toLowerCase()} Verified`}
            </p>

            {/* Verification Options */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {Object.values(verificationLevels).map((tier) => {
                const IconComponent = tier.icon;

                return (
                  <motion.div
                    key={tier.level}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                  >
                    <IconComponent className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2 text-center">{tier.level} Verification</h3>

                    <Button
                      className="w-full"
                      variant="default"
                      disabled={
                        verifying || // Disable while verifying
                        userTierId > tier.tierId || // User already at a higher tier
                        tier.verification_level === nftInfo?.tier?.verificationStatus.verification_level
                      }
                      onClick={() => handleVerify(tier)}
                    >
                      {verifying && currentTier?.tierId === tier.tierId
                        ? "Verifying..."
                        : nftInfo.tokenId === null || isDeviceVerified
                        ? "Claim NFT"
                        : userTierId > tier.tierId ||
                          tier.verification_level === nftInfo?.tier?.verificationStatus.verification_level
                        ? "Already Claimed"
                        : `Upgrade to ${tier.level}`}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Collateral section */}
          {isOrbVerified ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-6">
                <Shield className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gradient mb-6 text-center">Your NFT Tier</h2>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <motion.div
                  key={nftInfo.tokenId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <Card className="p-6 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{nftInfo?.tier.verificationStatus.level} Verified</h4>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm my-3 font-medium text-center ${
                        hasActiveLoan 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {hasActiveLoan ? "Used for Collateral" : "Available for Collateral"}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
