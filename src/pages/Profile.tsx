
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
        const response = await fetch(`${BACKEND_URL}/checkWallet?wallet=${ls_wallet}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Origin": window.location.origin,
          },
        });
        
        const data = await response.json();
        setNotificationStatus(data);
      } catch (error) {
        console.error("Error fetching notification status:", error);
        toast({
          title: "Error",
          description: "Failed to fetch notification status",
          variant: "destructive",
        });
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
                <ol className="list-decimal list-inside space-y-1 ml-2 text-sm text-left text-muted-foreground">
                  <li>Open the <span className="font-bold">World App</span></li>
                  <li>Tap the <span className="font-bold">settings icon</span> in the top right corner</li>
                  <li>Select <span className="font-bold">Apps</span></li>
                  <li>Find and tap on <span className="font-bold">Magnify Cash</span></li>
                  <li>Enable <span className="font-bold">Notifications</span> to stay updated</li>
                </ol>
              </div>
              
              <div className="aspect-video w-full mt-6 rounded-md overflow-hidden flex justify-center items-center relative">
                <video 
                  src="/magnify_notification_tutorial.MP4" 
                  className="w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  controls={false}
                  style={{ pointerEvents: "none" }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }
};

export default Dashboard;
