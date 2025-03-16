
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, InfoIcon, TrendingUp, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

const Lending = () => {
  const [loading, setLoading] = useState(false);

  const handleJoinWaitlist = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "You've joined the waitlist!",
        description: "We'll notify you when lending features are available.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Become a Lender" />

      <main className="container max-w-4xl mx-auto px-4 pt-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text">
            Earn interest by lending to verified users
          </h1>
          <p className="text-gray-700 mb-4 max-w-2xl mx-auto">
            Magnify Cash is building a lending marketplace powered by World ID verification. 
            Be among the first to earn interest on your digital assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#8B5CF6]" />
                Verified Borrowers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Lend only to users with verified World ID, reducing default risk.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#8B5CF6]" />
                Competitive Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Earn up to 12% APY on your capital through our smart-contract based lending pools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#8B5CF6]" />
                $MAG Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Earn $MAG tokens as additional rewards for providing liquidity.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Lending is coming soon
            </CardTitle>
            <CardDescription>
              We're currently in closed beta. Join our waitlist to get early access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 flex items-start gap-2 mb-4">
              <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>The lending feature will be available in the coming weeks. By joining the waitlist, you'll be among the first to participate.</span>
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleJoinWaitlist} 
              disabled={loading} 
              className="w-full bg-[#8B5CF6] hover:bg-[#7E69AB]"
            >
              {loading ? "Joining..." : "Join the Waitlist"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Lending;
