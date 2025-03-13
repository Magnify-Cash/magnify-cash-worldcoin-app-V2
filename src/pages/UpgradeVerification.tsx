
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { toast } from "@/hooks/use-toast";
import { useDemoData } from "@/providers/DemoDataProvider";

// Check if demo mode is enabled via environment variable
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const UpgradeVerification = () => {
  const navigate = useNavigate();
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  const { demoData, updateVerificationStatus, originationFee } = useDemoData();
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const verificationLevels = {
    device: {
      tierId: "1",
      level: "Device",
      icon: Shield,
      action: "mint-device-verified-nft",
      upgradeAction: "upgrade-device-verified-nft",
      verification_level: "Device",
    },
    orb: {
      tierId: "2",
      level: "Orb Scan",
      icon: Globe,
      action: "mint-orb-verified-nft",
      upgradeAction: "upgrade-orb-verified-nft",
      verification_level: "Orb",
    },
  };

  // Handle verification process
  const handleVerify = async (tier: typeof verificationLevels.device | typeof verificationLevels.orb) => {
    setVerifying(true);
    setCurrentTier(tier.tierId);

    try {
      // Demo mode - simulate verification
      if (isDemoMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Apply origination fee
        if (tier.level === "Device") {
          originationFee(true);
          updateVerificationStatus("DEVICE");
          toast({
            title: "Verification Successful",
            description: "You are now Device Verified.",
          });
        } else if (tier.level === "Orb Scan") {
          originationFee(false);
          updateVerificationStatus("ORB");
          toast({
            title: "Verification Successful",
            description: "You are now Orb Verified.",
          });
        }

        setTimeout(() => navigate("/loan"), 1500);
      } else {
        // Original World ID verification code (this will never run in demo mode)
        if (!window.miniKit?.isInstalled()) {
          toast({
            title: "Verification Failed",
            description: "Please install World App to verify.",
            variant: "destructive",
          });
          return;
        }
    
        const verifyPayload = {
          action: tier.action || tier.upgradeAction,
          signal: ls_wallet,
          verification_level: tier.verification_level,
        };
    
        try {
          const { finalPayload } = await window.miniKit.commandsAsync.verify(verifyPayload);
    
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
    
          if (tier.level === "Device") {
            updateVerificationStatus("DEVICE");
            toast({
              title: "Verification Successful",
              description: "You are now Device Verified.",
            });
          } else if (tier.level === "Orb Scan") {
            updateVerificationStatus("ORB");
            toast({
              title: "Verification Successful",
              description: "You are now Orb Verified.",
            });
          }
    
          setTimeout(() => navigate("/loan"), 1500);
        } catch (error) {
          console.error("Error during verification:", error);
    
          toast({
            title: "Verification Failed",
            description: "Something went wrong while verifying. Please try again.",
            variant: "destructive",
          });
        }
      }
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

  // Use demoData to check verification status
  const isDeviceVerified = demoData.isDeviceVerified;
  const isOrbVerified = demoData.isOrbVerified;

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
            {!isDeviceVerified && !isOrbVerified
              ? "Unverified"
              : `Currently: ${isOrbVerified ? "Orb" : "Device"} Verified`}
          </p>
        </motion.div>

        {/* Verification Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(verificationLevels).map((tier) => {
            const IconComponent = tier.icon;
            const isVerified = tier.level === "Device" ? isDeviceVerified : isOrbVerified;
            const isDisabled = verifying || isVerified;

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
                  disabled={isDisabled}
                  onClick={() => handleVerify(tier)}
                >
                  {verifying && currentTier === tier.tierId
                    ? "Verifying..."
                    : isVerified
                    ? "Already Verified"
                    : "Verify Now"}
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
