
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from "@worldcoin/minikit-js";
import { Shield, User, FileText, Pi, AlertTriangle, Bell, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { useMagnifyWorld, Tier } from "@/hooks/useMagnifyWorld";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import CreditScore from "@/components/CreditScore";
import { getTransactionHistory, verify } from "@/lib/backendRequests";

interface Transaction {
  status: "received" | "repaid";
  timestamp: string;
  amount: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const ls_username = localStorage.getItem("ls_username");
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";

  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const [verifying, setVerifying] = useState(false);
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);
  const [creditScore, setCreditScore] = useState(2);
  const [isVerificationSuccessful, setIsVerificationSuccessful] = useState(false);

  const nftInfo = data?.nftInfo || { tokenId: null, tier: null };
  console.log("NFT Info:", nftInfo);
  const hasActiveLoan = data?.loan?.[1]?.isActive === true;
  const loan = data?.loan;

  const isOrbVerified = nftInfo?.tier?.verificationStatus?.verification_level === "orb";
  const isDeviceVerified = nftInfo?.tier?.verificationStatus?.verification_level === "device";

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

  useEffect(() => {
    const calculateCreditScore = async () => {
      try {
        const transactions = await getTransactionHistory(ls_wallet);
  
        if (!isOrbVerified) {
          setCreditScore(1); // Credit score is 1 if not orb verified
          return;
        }
  
        if (transactions.length === 0) {
          setCreditScore(2); // Default credit score for orb-verified users with no transactions
          return;
        }
  
        if (hasActiveLoan && loan) {
          const receivedLoans = transactions.filter((tx) => tx.status === "received");
  
          if (receivedLoans.length > 0) {
            const lastReceivedLoan = receivedLoans[receivedLoans.length - 1];
            const loanAmount = parseFloat(lastReceivedLoan.amount);
  
            const loanTimestamp = new Date(lastReceivedLoan.timestamp).getTime();
            const currentTime = Date.now();
  
            const loanPeriodDays =
              loanAmount <= 1 ? 30 : loanAmount <= 5 ? 60 : 90;
  
            const loanPeriodMs = loanPeriodDays * 24 * 60 * 60 * 1000;
  
            if (currentTime > loanTimestamp + loanPeriodMs) {
              setCreditScore(-1); // Penalize for overdue loans
              return;
            }
          }
        }
  
        const repaidLoans = transactions.filter((tx) => tx.status === "repaid").length;
        setCreditScore(2 + Math.min(repaidLoans, 8)); // Formula for orb-verified users
      } catch (error) {
        console.error("Error calculating credit score:", error);
        setCreditScore(2); // Default score in case of error
      }
    };
  
    if (ls_wallet) {
      calculateCreditScore();
    }

    // Reset verification success state when data changes
    setIsVerificationSuccessful(false);
  }, [ls_wallet, hasActiveLoan, loan, isOrbVerified, data]);

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
  
    const isUpgradeAction = isDeviceVerified || nftInfo.tokenId !== null;
    console.log("Is upgrade action:", isUpgradeAction, "NFT Token ID:", nftInfo.tokenId);
    
    const verificationStatus = {
      claimAction: isUpgradeAction ? null : tier.action,
      upgradeAction: isUpgradeAction ? tier.upgradeAction : null,
      verification_level: tier.verification_level,
      level: tier.level,
    };
    
    const action = isUpgradeAction ? verificationStatus.upgradeAction : verificationStatus.claimAction;
    console.log("Using action:", action);
    
    if (!action) {
      console.error("No valid action found for verification");
      setVerifying(false);
      return;
    }
  
    const verifyPayload: VerifyCommandInput = {
      action: action,
      signal: ls_wallet,
      verification_level: verificationStatus.verification_level as VerificationLevel,
    };
    
    console.log("Verify payload:", verifyPayload);
  
    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
      console.log("Verification response:", finalPayload);
      
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
        setVerifying(false);
        return;
      }
  
      const tokenId = isUpgradeAction ? nftInfo.tokenId?.toString() : undefined;
      console.log("Using tokenId for verification:", tokenId);
  
      const isVerified = await verify(finalPayload, verificationStatus, ls_wallet, tokenId);
      if (isVerified) {
        setIsVerificationSuccessful(true);
        toast({
          title: "Verification Successful",
          description: `You are now ${verificationStatus.level} Verified.`,
        });
        await refetch();
      }
    } catch (error: any) {
      console.error("Error during verification:", error);
      console.error("NFT Info: ", nftInfo);
      console.error("Nft TokenId: ", nftInfo.tokenId);
      console.error("Tier: ", tier);
      console.error("Verification Status: ", verificationStatus);
      console.error("Is Upgrade Action: ", verificationStatus.upgradeAction === "upgrade-orb-verified-nft");
      console.error("Is orb verified: ", isOrbVerified);
      console.error("Is device verified: ", nftInfo?.tier?.verificationStatus.verification_level === "device");
      console.error("Wallet: " , ls_wallet);
      console.error("Action: ", action);
      console.error("Final Payload: ", JSON.stringify(verifyPayload));
  
      let errorMessage = "We are not able to verify you right now. Please try again later.";
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
  }, [ls_wallet, refetch, isDeviceVerified, nftInfo.tokenId, nftInfo, isOrbVerified]);

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
            ) : isDeviceVerified ? (
              <p className="text-muted-foreground text-center text-lg">Not Orb Verified</p>
            ) : (
              <p className="text-muted-foreground text-center text-lg">Unverified</p>
            )}
          </motion.div>

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

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {Object.values(verificationLevels).map((tier) => {
                const IconComponent = tier.icon;
                const isDeviceOrHasNFT = isDeviceVerified || nftInfo.tokenId !== null;
                
                let buttonText;
                if (verifying && currentTier?.tierId === tier.tierId) {
                  buttonText = "Verifying...";
                } else if (isOrbVerified || (tier.verification_level === nftInfo?.tier?.verificationStatus.verification_level) || isVerificationSuccessful) {
                  buttonText = "Already Claimed";
                } else if (isDeviceOrHasNFT) {
                  buttonText = "Upgrade NFT";
                } else {
                  buttonText = "Claim NFT";
                }

                // Determine if button should be disabled
                const isButtonDisabled = 
                  verifying || // Disable while verifying
                  isVerificationSuccessful || // Disable after successful verification until refresh
                  userTierId > tier.tierId || // User already at a higher tier
                  tier.verification_level === nftInfo?.tier?.verificationStatus.verification_level;

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
                      disabled={isButtonDisabled}
                      onClick={() => handleVerify(tier)}
                    >
                      {buttonText}
                    </Button>
                  </motion.div>
                );
              })}

              {nftInfo.tokenId === null && !isDeviceVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2 text-center">Device Verification</h3>

                  <Button className="w-full" variant="default" disabled>
                    No longer supported
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {isOrbVerified || isDeviceVerified ? (
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
                        <h4 className="font-medium text-lg">
                          {isOrbVerified ? nftInfo?.tier.verificationStatus.level : "Not Orb Verified"}
                        </h4>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm my-3 font-medium text-center ${
                        hasActiveLoan || isDeviceVerified
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {hasActiveLoan || isDeviceVerified ? "Unavailable for Collateral" : "Available for Collateral"}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CreditScore score={creditScore} className="w-full" />
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
