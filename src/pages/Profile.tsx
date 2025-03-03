
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

const Dashboard = () => {
  // hooks
  const navigate = useNavigate();
  const ls_username = localStorage.getItem("ls_username");
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  const { data, isLoading, isError, refetch } = useMagnifyWorld(ls_wallet as `0x${string}`);
  const [notificationStatus, setNotificationStatus] = useState<{ exists: boolean, notificationAllowed: boolean } | null>(null);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);

  // state
  const nftInfo = data?.nftInfo || { tokenId: null, tier: null };
  const hasActiveLoan = data?.loan?.[1]?.isActive === true;
  const loan = data?.loan;

  // Fetch notification status
  useEffect(() => {
    const fetchNotificationStatus = async () => {
      if (!ls_wallet) return;
      
      try {
        const response = await fetch(`${BACKEND_URL}/checkWallet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Origin": window.location.origin,
          },
          body: JSON.stringify({ wallet: ls_wallet }),
        });
        
        const data = await response.json();
        setNotificationStatus(data);
      } catch (error) {
        console.error("Error fetching notification status:", error);
      } finally {
        setIsNotificationLoading(false);
      }
    };
    
    fetchNotificationStatus();
  }, [ls_wallet]);

  if (isLoading || isNotificationLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Profile" />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="ellipsis-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
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
            {nftInfo.tokenId === null ? (
              <p className="text-muted-foreground text-center text-lg">Unverified</p>
            ) : (
              <p className="text-muted-foreground text-center text-lg">
                {nftInfo?.tier.verificationStatus.level} Verified User
              </p>
            )}
          </motion.div>

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

          {/* Notification Warning Section - Moved to the end */}
          {notificationStatus && !notificationStatus.notificationAllowed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-6">
                <AlertTriangle className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gradient mb-3 text-center">Stay Updated!</h2>
              <p className="text-muted-foreground text-center text-lg mb-6">
                Enable notifications to get instant alerts on new announcements, liquidity updates, and important events.
              </p>
              
              <div className="bg-black/5 p-4 rounded-md mt-2">
                <h4 className="font-medium mb-2 text-center">
                  How to enable notifications:
                </h4>
                <ol className="list-decimal list-inside space-y-1 ml-2 text-sm text-muted-foreground">
                  <li>Open World App</li>
                  <li>On the top right click settings</li>
                  <li>Click Apps</li>
                  <li>Click Magnify Cash</li>
                  <li>Allow Notifications</li>
                </ol>
              </div>
              
              <div className="aspect-video w-full mt-6 rounded-md overflow-hidden bg-gradient-to-r from-[#1A1E8F] to-[#A11F75]/20 flex justify-center items-center">
                <Bell className="w-16 h-16 text-white animate-pulse opacity-50" />
                <p className="absolute text-xs text-white/70">Notification tutorial video</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }
};

export default Dashboard;
