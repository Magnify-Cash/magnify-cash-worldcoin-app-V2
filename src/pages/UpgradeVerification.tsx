import { useState } from "react";
import { MiniKit, VerifyCommandInput, VerificationLevel } from "@worldcoin/minikit-js";
import { useNavigate } from "react-router-dom";
import { useMagnifyWorld, Tier } from "@/hooks/useMagnifyWorld";
import { Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { toast } from "@/hooks/use-toast";

const UpgradeVerification = () => {
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const [currentTier, setCurrentTier] = useState<Tier | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Verification levels
  const verificationLevels = {
    device: {
      tierId: BigInt(1),
      level: "Device",
      icon: Shield,
      action: "mint-device-verified-nft",
      upgradeAction: "upgrade-device-verified-nft",
      verification_level: VerificationLevel.Device,
    },
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
  const handleVerify = async (tier: typeof verificationLevels.device | typeof verificationLevels.orb) => {
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

    const verifyPayload: VerifyCommandInput = {
      action: tier.action || tier.upgradeAction,
      signal: ls_wallet,
      verification_level: tier.verification_level,
    };

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (finalPayload.status === "error") {
        console.error("Verification failed:", finalPayload);

        let errorMessage = "Something went wrong. Please try again.";
        if (finalPayload.error_code === "credential_unavailable") {
          errorMessage = "You are not Orb Verified in the WorldChain App. Please complete Orb verification first.";
        }

        toast({
          title: "Verification Failed",
          description: errorMessage,
          variant: "destructive",
        });

        setVerifying(false);
        return;
      }

      // ✅ Success: Update UI to reflect new verification level
      toast({
        title: "Verification Successful",
        description: `You are now ${tier.level} Verified.`,
      });

      // Simulate an update by refetching data (optional)
      refetch();

      // Redirect to profile after successful verification
      setTimeout(() => navigate("/profile"), 1500);
    } catch (error) {
      console.error("Error during verification:", error);

      toast({
        title: "Verification Failed",
        description: "Something went wrong while verifying. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Verification Level" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="dot-spinner">
            <div className="dot bg-[#1A1E8E]"></div>
            <div className="dot bg-[#4A3A9A]"></div>
            <div className="dot bg-[#7A2F8A]"></div>
            <div className="dot bg-[#A11F75]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen">
        <Header title="Verification Level" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <p className="text-red-500">Error fetching data. Please try again.</p>
        </div>
      </div>
    );
  }

  const nftInfo = data?.nftInfo || { tokenId: null, tier: null };
  const userTierId = nftInfo?.tier?.tierId || BigInt(0);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Verification Level" />
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gradient mb-2 text-center">Verification Level</h2>
          <p className="text-muted-foreground text-center text-lg">
            {nftInfo.tokenId === null
              ? "Unverified"
              : `Currently: ${nftInfo.tier?.verificationStatus.level.charAt(0).toUpperCase() +
                  nftInfo.tier?.verificationStatus.level.slice(1).toLowerCase()} Verified`}
          </p>
        </motion.div>

        {/* Verification Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    verifying ||
                    userTierId > tier.tierId ||
                    tier.verification_level === nftInfo?.tier?.verificationStatus.verification_level
                  }
                  onClick={() => handleVerify(tier)}
                >
                  {verifying && currentTier?.tierId === tier.tierId
                    ? "Verifying..."
                    : nftInfo.tokenId === null
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
      </div>
    </div>
  );
};

export default UpgradeVerification;
