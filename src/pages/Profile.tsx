import { useNavigate } from "react-router-dom";
import { DollarSign, Shield, User, FileText, Pi } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { useMagnifyWorld, Loan } from "@/hooks/useMagnifyWorld";
import { Card } from "@/components/ui/card";
import { formatUnits } from "viem";

const Dashboard = () => {
  // hooks
  const navigate = useNavigate();
  const ls_username = localStorage.getItem("ls_username");
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet);

  // state
  const nftInfo = data?.nftInfo || { tokenId: null, tier: null };
  const hasActiveLoan = data?.loan?.[1]?.isActive === true;
  const loan = data?.loan;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Profile" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!isLoading && data) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Profile" />
        {/* Header */}
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center mb-6">
              <User className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gradient mb-3 text-center break-words">@{ls_username}</h2>
            {nftInfo.tokenId === null ? (
              <p className="text-muted-foreground text-center text-lg">Unverified</p>
            ) : (
              <p className="text-muted-foreground text-center text-lg">
                {nftInfo?.tier.verificationStatus.level} Verified User
              </p>
            )}
          </motion.div>

          {/* Loan Status */}
          {/* Loan Status */}
          {/*
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-primary" />
              Loan Status
            </h2>


            {hasActiveLoan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-secondary/5 hover:bg-secondary/10 dark:bg-secondary/10 dark:hover:bg-secondary/20 rounded-xl transition-colors duration-300">
                  <div className="space-y-1">
                    <p className="text-xl font-semibold">Active Loan</p>
                    <p className="text-muted-foreground">Collateralized by World ID</p>
                  </div>
                  <button
                    onClick={() => navigate("/repay-loan")}
                    className="glass-button transform hover:scale-105 transition-transform duration-300"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-secondary/5 hover:bg-secondary/10 dark:bg-secondary/10 dark:hover:bg-secondary/20 rounded-xl transition-colors duration-300">
                <p className="text-lg font-semibold">No Active Loans</p>
                <p className="text-muted-foreground">
                  You currently have no loans. Would you like to apply for one?
                </p>
                <button
                  onClick={() => navigate("/loan")}
                  className="glass-button mt-4 transform hover:scale-105 transition-transform duration-300"
                >
                  Apply for Loan
                </button>
              </div>
            )}
          </motion.div>
          */}

          {/* Collateral section */}
          {nftInfo.tokenId !== null ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                Your NFT Tier
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  key={nftInfo.tokenId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (1 + 1) }}
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + 1 * 0.1 }}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <Card className="p-4">
                      <div className="flex-column items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{nftInfo?.tier.verificationStatus.level} Verified</h4>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm my-3 ${
                            hasActiveLoan ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {hasActiveLoan ? "Used for Collateral" : "Available for Collateral"}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
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
                disabled={isLoading}
              >
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default Dashboard;
