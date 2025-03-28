
import { useState, useEffect } from "react";
import { Shield, User, FileText, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import CreditScore from "@/components/CreditScore";
import { getTransactionHistory } from "@/lib/backendRequests";
import { useDemoData } from "@/providers/DemoDataProvider";
import { VerificationDrawer } from "@/components/VerificationDrawer";

interface Transaction {
  status: "received" | "repaid";
  timestamp: string;
  amount: string;
}

const Dashboard = () => {
  const ls_username = localStorage.getItem("ls_username");
  const ls_wallet = localStorage.getItem("ls_wallet_address") || "";
  
  const { demoData, updateVerificationStatus, getCreditScore } = useDemoData();
  const [verifying, setVerifying] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Orb Scan");
  const [creditScore, setCreditScore] = useState(1); // Changed default to 1
  const [isVerificationSuccessful, setIsVerificationSuccessful] = useState(false);

  // Extract verification status from demo data
  const isDeviceVerified = demoData.isDeviceVerified;
  const isOrbVerified = demoData.isOrbVerified;
  const hasActiveLoan = demoData.hasLoan;
  
  // User's NFT info from demo data
  const nftInfo = demoData.contractData.nftInfo;

  const verificationLevels = {
    orb: {
      tierId: "2",
      level: "Orb Scan",
      icon: Globe,
    }
  };

  useEffect(() => {
    // Use the credit score from demo data
    setCreditScore(demoData.creditScore);
    
    // Reset verification success state when data changes
    setIsVerificationSuccessful(false);
  }, [demoData]);

  const handleVerify = (tier: typeof verificationLevels.orb) => {
    setVerifying(true);
    setSelectedTier(tier.level);
    setIsDrawerOpen(true);
  };

  const handleVerified = () => {
    updateVerificationStatus("ORB");
    setIsVerificationSuccessful(true);
    toast({
      title: "Verification Successful",
      description: "You are now Orb Verified.",
    });
    setVerifying(false);
  };

  // Function to handle drawer close
  const handleDrawerClose = () => {
    setVerifying(false);
  };

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
          {isOrbVerified || isVerificationSuccessful ? (
            <p className="text-muted-foreground text-center text-lg">ORB Verified User</p>
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
            {isOrbVerified || isVerificationSuccessful
              ? "Currently: Orb Verified"
              : isDeviceVerified || nftInfo.tokenId === null
              ? "Unverified"
              : `Currently: ${isDeviceVerified ? "Device" : "Unverified"}`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {Object.values(verificationLevels).map((tier) => {
              const IconComponent = tier.icon;
              
              let buttonText;
              if (verifying) {
                buttonText = "Verifying...";
              } else if (isOrbVerified || isVerificationSuccessful) {
                buttonText = "Already Claimed";
              } else if (isDeviceVerified || nftInfo.tokenId !== null) {
                buttonText = "Upgrade NFT";
              } else {
                buttonText = "Claim NFT";
              }

              // Determine if button should be disabled
              const isButtonDisabled = 
                verifying || // Disable while verifying
                isVerificationSuccessful || // Disable after successful verification until refresh
                isOrbVerified; // User already at the highest tier

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

        {isOrbVerified || isDeviceVerified || isVerificationSuccessful ? (
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

            <div>
              <motion.div
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
                      {(isOrbVerified || isVerificationSuccessful) ? "ORB" : "Not Orb Verified"}
                    </h4>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm my-3 font-medium text-center ${
                      isVerificationSuccessful
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : hasActiveLoan || (isDeviceVerified && !isOrbVerified)
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {hasActiveLoan || (isDeviceVerified && !isVerificationSuccessful && !isOrbVerified)
                    ? "Unavailable for Collateral"
                    : "Available for Collateral"}
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

export default Dashboard;
