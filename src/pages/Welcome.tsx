import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MiniKit, MiniAppWalletAuthPayload } from "@worldcoin/minikit-js";
import { ArrowRight, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePoolData } from "@/contexts/PoolDataContext";
import { prefetchBorrowerInfo } from "@/utils/borrowerInfoUtils";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { switchToWorldChain } from "@/utils/switchToWorldChain";

type ExtendedWalletAuthPayload = MiniAppWalletAuthPayload & {
  address: string;
};

const Welcome = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { pools, refreshPools, lastFetched, hasFetchStarted, loading: poolsLoading } = usePoolData();
  

  const [loadingLoan, setLoadingLoan] = useState(false);
  const [loadingLender, setLoadingLender] = useState(false);
  const [prefetchingBorrowerInfo, setPrefetchingBorrowerInfo] = useState(false);
  const [isMiniApp, setIsMiniApp] = useState(false);

  const { connectAsync } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (MiniKit.isInstalled()) {
      setIsMiniApp(true);
      
      localStorage.removeItem("ls_metamask_user");
    }
  }, []);

  useEffect(() => {
    if (!hasFetchStarted || (pools.length === 0 && !poolsLoading)) {
      refreshPools(false).catch(console.error);
    }
  }, [refreshPools, lastFetched, hasFetchStarted, pools, poolsLoading]);

  useEffect(() => {
    if (pools.length > 0 && !prefetchingBorrowerInfo && !poolsLoading) {
      setPrefetchingBorrowerInfo(true);
      const contractAddresses = pools
        .filter(pool => pool.contract_address && pool.status === "active")
        .map(pool => pool.contract_address!);

      if (contractAddresses.length > 0) {
        prefetchBorrowerInfo(contractAddresses).catch(console.error);
      }
    }
  }, [pools, prefetchingBorrowerInfo, poolsLoading]);

  const handleLogin = async (redirectTo: string, isLender: boolean) => {
    if (isMiniApp) {
      // MINIKIT FLOW
      try {
        isLender ? setLoadingLender(true) : setLoadingLoan(true);
  
        const nonce = crypto.randomUUID().replace(/-/g, "");
        const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
          nonce,
          statement: "Sign in to Magnify Cash to manage your loans.",
          expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
        });
  
        const extendedPayload = finalPayload as ExtendedWalletAuthPayload;
        if (extendedPayload?.address) {
          const user = await MiniKit.getUserByAddress(extendedPayload.address);
          localStorage.setItem("ls_wallet_address", user.walletAddress);
          localStorage.setItem("ls_username", user.username);
          localStorage.removeItem("ls_metamask_user");
  
          toast.toast({
            title: "Successfully signed in!",
            description: `Welcome back, ${user.username}!`,
          });
  
          navigate(redirectTo);
        } else {
          throw new Error("Missing wallet address from MiniKit.");
        }
      } catch (error) {
        console.error("MiniKit auth failed:", error);
        toast.toast({
          title: "Error",
          description: "Failed to sign in. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingLoan(false);
        setLoadingLender(false);
      }
    } else {
      // NON-MINIAPP USERS
      if (!isLender) {
        toast.toast({
          title: "MiniApp Required",
          description: "Please use our MiniApp in the World App to get a loan.",
          variant: "destructive",
        });
        return;
      }
  
      try {
        setLoadingLender(true);
        let currentAddress = address;
        
        if (!isConnected || !currentAddress) {
          const result = await connectAsync({ connector: injected() });
          currentAddress = result.accounts[0];
          
          if (!currentAddress) {
            throw new Error("Failed to connect wallet");
          }
        }
        
        await switchToWorldChain();
        
        localStorage.setItem("ls_wallet_address", currentAddress);
        localStorage.setItem("ls_username", currentAddress);
        localStorage.setItem("ls_metamask_user", "true");
        
        toast.toast({
          title: "Wallet Connected",
          description: `Connected to ${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`,
        });
  
        navigate(redirectTo);
      } catch (err) {
        console.error("Wallet connection or chain switch failed:", err);
        toast.toast({
          title: "Connection Failed",
          description: "Please ensure your wallet is unlocked and try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingLender(false);
      }
    }
  };
  

  return (
    <div className="min-h-screen bg-white">
      <nav className="px-3 sm:px-6 py-4 flex justify-between items-center border-b border-gray-100 safe-area-inset-top">
        <div className="flex items-center gap-2">
          <img
            alt="Magnify Cash Logo"
            className="w-8 h-8 rounded-[20%]"
            src="/lovable-uploads/a58f7265-4f91-4fe4-9870-a88ac9aadba9.jpg"
          />
          <div className="text-gray-900 text-lg sm:text-2xl font-medium truncate">
            Magnify Cash
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-3 sm:px-6 pt-8 sm:pt-20 pb-12 sm:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text animate-gradient leading-tight">
            Get a loan just by being you.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-12 max-w-[90%] sm:max-w-2xl mx-auto font-medium">
            Get instant loans backed by your World ID. No collateral needed, just your verified digital presence.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-16 px-3 sm:px-4">
            <button
              disabled={loadingLoan}
              onClick={() => handleLogin("/wallet", false)}
              className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] text-base"
            >
              {loadingLoan ? "Connecting..." : "Get a Loan"}
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              disabled={loadingLender}
              onClick={() => handleLogin("/lending", true)}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-200 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#D946EF] text-white hover:opacity-90 transition-all duration-300 font-medium w-full sm:w-auto min-h-[48px] text-base"
            >
              {loadingLender ? "Connecting..." : "Become a Lender"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-600 px-3 sm:px-4 text-center">
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              Verified by World ID. Settled on World Chain. Powered by $MAG.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
