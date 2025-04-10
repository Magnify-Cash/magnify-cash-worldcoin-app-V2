
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { ChevronUp, Info, AlertTriangle, LineChart, DollarSign, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

const LenderGuide = () => {
  const navigate = useNavigate();
  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    // Check if user is in MiniApp or in browser with MetaMask
    const isMiniAppUser = !localStorage.getItem("ls_metamask_user");
    setIsMiniApp(isMiniAppUser);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative bg-white">
      <Header title="Lender Help Center" />
      
      <div className="p-6 text-left max-w-4xl mx-auto">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
            Lender Guide: How to Earn with Magnify Cash
          </h1>

          <div className="space-y-8">
            <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
                1. Supply Liquidity
              </h2>
              <p className="text-gray-600 mb-6">
                Provide liquidity to our lending pools and earn yield on your assets
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="border border-[#5A1A8F]/10">
                  <CardHeader>
                    <DollarSign className="h-6 w-6 text-[#5A1A8F]" />
                    <CardTitle>Earn Yield</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Supply USDC to earn competitive APY rates on your assets</p>
                  </CardContent>
                </Card>
                <Card className="border border-[#5A1A8F]/10">
                  <CardHeader>
                    <LineChart className="h-6 w-6 text-[#5A1A8F]" />
                    <CardTitle>Track Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Monitor your investment growth in real-time</p>
                  </CardContent>
                </Card>
                <Card className="border border-[#5A1A8F]/10">
                  <CardHeader>
                    <Clock className="h-6 w-6 text-[#5A1A8F]" />
                    <CardTitle>Flexible Terms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Choose from different pools with varying APY rates and terms</p>
                  </CardContent>
                </Card>
              </div>

              <div className="glass-card p-4 border-l-4 border-[#5A1A8F] bg-gradient-to-r from-[#5A1A8F]/5 to-transparent">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#5A1A8F] flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    💡 Tip: Browse available pools on the Lending page to find the best APY rates for your investment goals.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
                2. Manage Your Portfolio
              </h2>
                <p className="text-gray-600 mb-6">
                Track your supplied assets and earnings through the Portfolio page
                </p>
              <div className="glass-card p-4 border-l-4 border-[#5A1A8F] bg-gradient-to-r from-[#5A1A8F]/5 to-transparent">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#5A1A8F] flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    💡 Tip: Use the Portfolio page to see your current positions, accumulated interest, and overall performance.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
                3. Withdraw Funds
              </h2>
              <p className="text-gray-600 mb-6">
                Withdraw your supplied assets along with earned interest at any time
              </p>
              <div className="glass-card p-4 border-l-4 border-[#5A1A8F] bg-gradient-to-r from-[#5A1A8F]/5 to-transparent">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#5A1A8F] flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    💡 Tip: Use the Withdraw feature from your Portfolio to access your funds and earned interest when needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
            How Liquidity Pools Work
          </h1>
          <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
            <p className="text-gray-600 mb-6">
              Magnify Cash offers termed liquidity pools, where lenders contribute funds during the warm-up and active periods. Once a pool opens for borrowing, funds become available to borrowers. Lenders receive LP tokens that represent their share of the specific pool. These tokens increase in value as loans are repaid with interest. Since pools operate on fixed terms, funds remain in the pool until maturity, at which point lenders can withdraw their balance along with any earnings.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
            Pool Lifecycle
          </h1>
          <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
            <p className="text-gray-600 mb-6">
              Each liquidity pool progresses through four defined phases: Warm-up, Active, Cooldown, and Withdrawal.
            </p>
            <p className="text-gray-600 mb-6">
              During the Warm-up period, lenders can supply funds to the pool in exchange for LP tokens. Withdrawals are allowed, but a small fee applies to discourage spamming.
            </p>
            <p className="text-gray-600 mb-6">
              In the Active period, lenders can continue contributing funds, but withdrawals are no longer allowed. This is also when borrowers begin accessing the pool for loans.
            </p>
            <p className="text-gray-600 mb-6">
              During the Cooldown period, borrowing is paused, and borrowers focus on repaying their outstanding loans. Lenders cannot contribute or withdraw during this time, allowing for a clear assessment of loan repayment outcomes and accurate calculation of final LP token value.
            </p>
            <p className="text-gray-600 mb-6">
              In the Withdrawal period, the pool reaches maturity. LP token prices have stabilized based on the pool's performance, and lenders can redeem their tokens to withdraw their original funds along with any accrued yield.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
            Risk Management
          </h1>
          <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
            <p className="text-gray-600 mb-6">
              Magnify Cash is designed with strong safeguards to protect lenders and support responsible borrowing.
            </p>
            <p className="text-gray-600 mb-6">
              Borrowers can only access the platform through the World App and must complete World ID (ORB) verification, ensuring all borrowers are real, verified individuals.
            </p>
            <p className="text-gray-600 mb-6">
              Each borrower is limited to one active loan at a time, regardless of how many liquidity pools exist.
            </p>
            <p className="text-gray-600 mb-6">
              If a borrower defaults, they are blocked from accessing new loans across all pools until they repay their defaulted loan plus a defaulter's fee.
            </p>
            <p className="text-gray-600 mb-6">
              Lenders are primarily encouraged to access the platform through the World App for a seamless in-app experience. However, access via MetaMask in browser is also supported for advanced users who prefer it.
            </p>
          </div>
        </section>

        {isMiniApp && (
          <section className="mb-12">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
                Stay Updated!
              </h1>
            <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-center mb-6">
                    <AlertTriangle className="w-16 h-16 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-center text-lg mb-6">
                    Enable notifications to get instant alerts on new pools, APY changes, and important updates for lenders.
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
          </section>
        )}

        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
            Lender FAQ
          </h1>
          <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  How are APY rates determined?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  APY rates are determined based on pool utilization, market demand, and duration of the lending pool. Higher utilization generally translates to higher APY for lenders.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  Can I withdraw my funds anytime?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes, you can withdraw your supplied assets at any time, along with the accrued interest. However, some pools may have early withdrawal fees to discourage frequent withdrawals and maintain pool stability.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What currencies can I supply to the lending pools?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Currently, our lending pools accept USDC. We plan to expand to other stablecoins and cryptocurrencies in future updates.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  How are my supplied assets protected?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  All loans are backed by World ID-verified borrowers with NFT collateral. Our risk management system ensures that lending pools maintain appropriate liquidity and collateralization ratios.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What are LP tokens?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  LP (Liquidity Provider) tokens represent your share in a lending pool. When you supply assets, you receive LP tokens proportional to your contribution. These tokens can be redeemed for your original assets plus earned interest when you withdraw.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  How is interest calculated and paid?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Interest accrues continuously based on the APY of the pool. Your earned interest is automatically reflected in the value of your LP tokens and is paid out when you withdraw your assets from the pool.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  Where can I get the latest updates about new lending pools?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  You can stay updated by joining us on{" "}
                  <a className="text-[#5A1A8F] hover:text-[#1A1E8F] transition-colors underline" href="https://t.me/MagnifyCommunity">
                    Telegram
                  </a>{" "}
                  and{" "}
                  <a className="text-[#5A1A8F] hover:text-[#1A1E8F] transition-colors underline" href="https://discord.gg/magnifycash">
                    Discord
                  </a>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  I&apos;ve encountered an issue with my lending position. How can I get support?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Join us on{" "} 
                  <a className="text-[#5A1A8F] hover:text-[#1A1E8F] transition-colors underline" href="https://discord.gg/magnifycash">
                      Discord
                  </a>, where you&apos;ll be able to ask questions and raise a Support Ticket so that our team can help you out.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-white 
                   shadow-[0_0_15px_rgba(90,26,143,0.1)]
                   hover:shadow-[0_0_20px_rgba(90,26,143,0.2)] 
                   transition-all duration-300 
                   border border-[#5A1A8F]/10"
        >
          <ChevronUp className="w-6 h-6 text-[#5A1A8F]" />
        </button>
      </div>
    </div>
  );
};

export default LenderGuide;
