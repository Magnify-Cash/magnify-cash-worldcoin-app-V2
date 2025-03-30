
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MiniKit } from "@worldcoin/minikit-js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Globe, Star } from "lucide-react";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";
import { useToast } from "@/hooks/use-toast";

// Define the membership tier structure
interface MembershipTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  description: string;
  loanAmount: string;
  fee: string;
  recommended?: boolean;
}

const membershipTiers: MembershipTier[] = [
  {
    id: "bronze",
    name: "Bronze",
    price: "0.05 ETH",
    loanAmount: "$10",
    fee: "$1",
    description: "Basic membership with small loan access",
    features: [
      "Access to $10 loans",
      "$1 fixed fee",
      "30-day loan period",
      "Basic customer support",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: "0.1 ETH",
    loanAmount: "$20",
    fee: "$2",
    description: "Our most popular tier for medium-sized loans",
    features: [
      "Access to $20 loans",
      "$2 fixed fee",
      "30-day loan period",
      "Priority customer support",
      "Weekly market insights",
    ],
    recommended: true,
  },
  {
    id: "gold",
    name: "Gold",
    price: "0.25 ETH",
    loanAmount: "$30",
    fee: "$3",
    description: "Premium tier with the largest loan amounts",
    features: [
      "Access to $30 loans",
      "$3 fixed fee",
      "30-day loan period",
      "24/7 dedicated support",
      "Exclusive investment opportunities",
    ],
  },
];

export default function Membership() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [minting, setMinting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet is already connected
    const storedWalletAddress = localStorage.getItem("ls_wallet_address");
    if (storedWalletAddress) {
      setWalletConnected(true);
      setWalletAddress(storedWalletAddress);
    }
  }, []);

  const handleConnectWallet = async () => {
    try {
      // Using the correct method from MiniKit API - it doesn't have connectWallet
      // Let's use the id-wallet functionality instead
      const result = await MiniKit.commandsAsync.idWallet({
        clientId: WORLDCOIN_CLIENT_ID ?? "",
      });
      
      if (result.commandPayload && result.finalPayload.status === "success") {
        setWalletConnected(true);
        // The nullish coalescing operator ensures we never set an empty string that would fail the type check
        const address = result.finalPayload.walletAddress || "0x0000000000000000000000000000000000000000";
        setWalletAddress(address);
        localStorage.setItem("ls_wallet_address", address);
        localStorage.setItem("ls_username", result.finalPayload.username || "User");
        
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected.",
        });
      } else {
        console.error("Connection error:", result);
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting your wallet.",
        variant: "destructive",
      });
    }
  };

  const handleMint = async (tierId: string) => {
    setMinting(true);
    
    try {
      // Simulate minting process with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast({
        title: "Membership NFT Minted!",
        description: `You have successfully minted the ${tierId.toUpperCase()} membership NFT.`,
      });
      
      // After successful minting, navigate to the loan page
      setTimeout(() => {
        navigate("/loan");
      }, 2000);
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast({
        title: "Minting Failed",
        description: "Failed to mint membership NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="NFT Membership" />
      
      <main className="container px-4 py-6 max-w-4xl mx-auto">
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2">Membership Benefits</h1>
            <p className="text-muted-foreground mb-6">
              Join our exclusive membership program and unlock premium features and benefits.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Fast Loans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get quick access to loans with simplified application process.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Star className="mr-2 h-5 w-5 text-primary" />
                    Fixed Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Enjoy transparent fixed fees based on your membership tier.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Globe className="mr-2 h-5 w-5 text-primary" />
                    Global Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Access the platform from anywhere with your Worldcoin ID.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {!walletConnected ? (
              <div className="text-center mb-8">
                <Button 
                  size="lg" 
                  onClick={handleConnectWallet}
                  className="bg-primary hover:bg-primary/90"
                >
                  Connect Wallet to Continue
                </Button>
              </div>
            ) : null}
          </motion.div>
        </section>
        
        {walletConnected && (
          <section>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-6">Choose Your Membership Tier</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {membershipTiers.map((tier) => (
                  <Card 
                    key={tier.id}
                    className={`relative ${
                      selectedTier === tier.id ? 'border-primary ring-2 ring-primary' : ''
                    } ${tier.recommended ? 'border-primary/50' : ''}`}
                  >
                    {tier.recommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                        Recommended
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{tier.name}</CardTitle>
                      <CardDescription>{tier.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between mb-4">
                        <span className="text-sm font-medium">Loan Amount:</span>
                        <span className="text-sm font-bold">{tier.loanAmount}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="text-sm font-medium">Fixed Fee:</span>
                        <span className="text-sm font-bold">{tier.fee}</span>
                      </div>
                      <p className="text-sm mb-4">{tier.description}</p>
                      <ul className="space-y-2">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => {
                          setSelectedTier(tier.id);
                          handleMint(tier.id);
                        }}
                        disabled={minting}
                      >
                        {minting && selectedTier === tier.id ? "Minting..." : "Mint Membership NFT"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </motion.div>
          </section>
        )}
        
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary font-medium">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Connect Your Wallet</h3>
                      <p className="text-sm text-muted-foreground">Connect your wallet to verify your identity.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary font-medium">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Choose a Membership Tier</h3>
                      <p className="text-sm text-muted-foreground">Select the membership tier that best fits your needs.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary font-medium">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Mint Your NFT</h3>
                      <p className="text-sm text-muted-foreground">Complete the transaction to mint your membership NFT.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary font-medium">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Enjoy Benefits</h3>
                      <p className="text-sm text-muted-foreground">Start enjoying your membership benefits immediately.</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>
    </div>
  );
