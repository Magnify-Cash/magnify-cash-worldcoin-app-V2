
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { toast } from "@/hooks/use-toast";
import { useDemoData } from "@/providers/DemoDataProvider";
import { VerificationDrawer } from "@/components/VerificationDrawer";

const UpgradeVerification = () => {
  const navigate = useNavigate();
  const { demoData, updateVerificationStatus } = useDemoData();
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"Device" | "Orb Scan">("Device");

  const verificationLevels = {
    device: {
      tierId: "1",
      level: "Device",
      icon: Shield,
    },
    orb: {
      tierId: "2",
      level: "Orb Scan",
      icon: Globe,
    },
  };

  // Handle verification process
  const handleVerify = (tier: typeof verificationLevels.device | typeof verificationLevels.orb) => {
    setVerifying(true);
    setCurrentTier(tier.tierId);
    setSelectedTier(tier.level as "Device" | "Orb Scan");
    setIsDrawerOpen(true);
  };

  const handleVerified = () => {
    if (selectedTier === "Device") {
      updateVerificationStatus("DEVICE");
      toast({
        title: "Verification Successful",
        description: "You are now Device Verified.",
      });
    } else if (selectedTier === "Orb Scan") {
      updateVerificationStatus("ORB");
      toast({
        title: "Verification Successful",
        description: "You are now Orb Verified.",
      });
    }
    
    setVerifying(false);
    setTimeout(() => navigate("/loan"), 1500);
  };

  // Function to handle drawer close
  const handleDrawerClose = () => {
    setVerifying(false);
    setCurrentTier(null);
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

      {/* Verification Drawer */}
      <VerificationDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        onVerified={handleVerified}
        onClose={handleDrawerClose}
        tier={selectedTier}
      />
    </div>
  );
};

export default UpgradeVerification;
