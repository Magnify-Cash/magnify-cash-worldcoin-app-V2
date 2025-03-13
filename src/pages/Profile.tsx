import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Shield, User, FileText, Pi, AlertTriangle, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { useMagnifyWorld } from "@/hooks/useMagnifyWorld";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/utils/constants";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  // hooks
  const navigate = useNavigate();
  const ls_username = localStorage.getItem("ls_username");
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);

  // state
  const nftInfo = data?.nftInfo || { tokenId: null, tier: null };
  const hasActiveLoan = data?.loan?.[1]?.isActive === true;
  const loan = data?.loan;

  // Check if the user is verified by ORB device

  const isOrbVerified = nftInfo?.tier?.verificationStatus?.verification_level === "orb";
  
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
    return (
      <div className="min-h-screen bg-background">
        <Header title="Profile" />
        {/* Header */}
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
          ) : (
            <div className="flex-column justify-center items-center h-[calc(100vh-80px)]">
              <h2 className="text-2xl font-semibold mb-4">You are unverified</h2>
              <p className="mb-4">
                To be eligible for a loan, you need to own a specific NFT and be verified by an ORB device. Please upgrade your account to include this NFT.
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
