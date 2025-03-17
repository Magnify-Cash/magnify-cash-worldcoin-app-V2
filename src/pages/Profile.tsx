import { useNavigate } from "react-router-dom";
import { User, Shield, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { useDemoData } from "@/providers/DemoDataProvider";
import CreditScore from "@/components/CreditScore";

const Dashboard = () => {
  const navigate = useNavigate();
  const ls_username = localStorage.getItem("ls_username") || "Guest";
  const { demoData } = useDemoData();

  // Extracting necessary data from demoData
  const { contractData, isDeviceVerified, isOrbVerified, hasLoan, creditScore } = demoData;
  const nftInfo = contractData.nftInfo;
  const isVerified = nftInfo.tokenId !== null;
  const verificationLevel = nftInfo.tier?.verificationStatus.level || "Unverified";

  return (
    <div className="min-h-screen bg-background">
      <Header title="Profile" />
      <div className="max-w-4xl mx-auto space-y-8 px-4 py-6">
        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
        >
          <div className="flex items-center justify-center mb-6">
            <User className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gradient mb-3 text-center break-words">@{ls_username}</h2>
          <p className="text-muted-foreground text-center text-lg">
            {isVerified ? `${verificationLevel} Verified User` : "Unverified"}
          </p>
        </motion.div>

        {/* Verification Status & Collateral */}
        {isVerified ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <h4 className="font-medium text-lg">{verificationLevel} Verified</h4>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm my-3 font-medium text-center ${
                        hasLoan
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {hasLoan ? "Used for Collateral" : "Available for Collateral"}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>

            {/* Credit Score Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CreditScore score={creditScore} className="h-full" />
            </motion.div>
          </div>
        ) : (
          <div className="flex-column justify-center items-center h-[calc(100vh-80px)]">
            <h2 className="text-2xl font-semibold mb-4">You are unverified</h2>
            <p className="mb-4">
              To be eligible for a loan, you need to own a specific NFT. Please upgrade your account to
              include this NFT.
            </p>
            <button
              onClick={() => navigate("/upgrade-verification")}
              className="glass-button w-full"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
