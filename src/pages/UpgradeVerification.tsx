
import { useState } from "react";
import { MiniKit, VerifyCommandInput, VerificationLevel } from "@worldcoin/minikit-js";
import { useNavigate } from "react-router-dom";
import { Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { useDemoData } from "@/providers/DemoDataProvider";

const UpgradeVerification = () => {
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const { demoData, updateVerificationStatus } = useDemoData();
  const [verifying, setVerifying] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<"DEVICE" | "ORB" | null>(null);

  // Verification levels
  const verificationLevels = {
    device: {
      level: "DEVICE",
      icon: Shield,
      action: "mint-device-verified-nft",
      verification_level: VerificationLevel.Device,
    },
    orb: {
      level: "ORB",
      icon: Globe,
      action: "mint-orb-verified-nft",
      verification_level: VerificationLevel.Orb,
    },
  };

  // Handle verification process
  const handleVerify = async (level: "DEVICE" | "ORB") => {
    if (!MiniKit.isInstalled()) {
      toast("Please install World App to verify.");
      return;
    }

    setVerifying(true);
    setCurrentLevel(level);

    const verificationConfig = level === "DEVICE" 
      ? verificationLevels.device 
      : verificationLevels.orb;

    const verifyPayload: VerifyCommandInput = {
      action: verificationConfig.action,
      signal: ls_wallet,
      verification_level: verificationConfig.verification_level,
    };

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
      
      if (finalPayload.status === "success") {
        updateVerificationStatus(level);
        toast.success(`You are now ${level} Verified!`);
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        if (finalPayload.error_code === "credential_unavailable") {
          toast.error("You are not Orb Verified in the WorldChain App. Please complete Orb verification first.");
        } else {
          toast.error("Verification failed. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Error during verification:", error);
      toast.error(error?.error_code === "credential_unavailable" 
        ? "You are not Orb Verified in the WorldChain App. Please complete Orb verification first."
        : "Something went wrong while verifying.");
    } finally {
      setVerifying(false);
      setCurrentLevel(null);
    }
  };

  const nftInfo = demoData.contractData?.nftInfo;
  const userVerificationLevel = nftInfo?.tier?.verificationStatus?.level || null;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Verification Level" />
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
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
            {!userVerificationLevel ? "Unverified" : `${userVerificationLevel} Verified`}
          </p>
        </motion.div>

        {/* Verification Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(verificationLevels).map(([key, data]) => {
            const IconComponent = data.icon;
            const isCurrentlyVerifying = verifying && currentLevel === data.level;
            const alreadyVerified = userVerificationLevel === data.level;
            const higherTierVerified = userVerificationLevel === "ORB" && data.level === "DEVICE";

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <IconComponent className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2 text-center">{data.level} Verification</h3>

                <Button
                  className="w-full"
                  variant="default"
                  disabled={verifying || alreadyVerified || higherTierVerified}
                  onClick={() => handleVerify(data.level)}
                >
                  {isCurrentlyVerifying
                    ? "Verifying..."
                    : alreadyVerified || higherTierVerified
                    ? "Already Verified"
                    : `Verify with ${data.level}`}
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
