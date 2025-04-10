import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { ChevronUp, Info, AlertTriangle, Clock, Play, Pause, Download } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] flex items-center justify-center">
              <Info className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
              How Liquidity Pools Work
            </h2>
          </div>
          <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
            <div className="space-y-6">
              <div className="rounded-lg bg-gradient-to-r from-[#f1f0fb]/50 to-white p-6 shadow-sm border border-[#5A1A8F]/10">
                <h3 className="text-xl font-semibold mb-3 text-[#5A1A8F]">Termed Liquidity Pools</h3>
                <p className="text-gray-700 leading-relaxed">
                  Magnify Cash offers <span className="font-semibold">termed liquidity pools</span>, where lenders contribute 
                  funds during the warm-up and active periods. Once a pool opens for borrowing, funds become 
                  available to borrowers.
                </p>
              </div>
              
              <div className="rounded-lg bg-gradient-to-r from-[#f1f0fb]/50 to-white p-6 shadow-sm border border-[#5A1A8F]/10">
                <h3 className="text-xl font-semibold mb-3 text-[#5A1A8F]">LP Tokens</h3>
                <p className="text-gray-700 leading-relaxed">
                  Lenders receive <span className="font-semibold">LP tokens</span> that represent their share of the specific pool. 
                  These tokens increase in value as loans are repaid with interest.
                </p>
              </div>
              
              <div className="rounded-lg bg-gradient-to-r from-[#f1f0fb]/50 to-white p-6 shadow-sm border border-[#5A1A8F]/10">
                <h3 className="text-xl font-semibold mb-3 text-[#5A1A8F]">Fixed Terms</h3>
                <p className="text-gray-700 leading-relaxed">
                  Since pools operate on <span className="font-semibold">fixed terms</span>, funds remain in the pool until maturity, 
                  at which point lenders can withdraw their balance along with any earnings.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
              Pool Lifecycle
            </h2>
          </div>
          <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
            <p className="text-gray-700 mb-8 leading-relaxed">
              Each liquidity pool progresses through four defined phases, each with unique characteristics and rules:
            </p>
            
            {/* Pool Lifecycle Diagram */}
            <div className="mb-12 overflow-hidden">
              <div className="relative h-32 md:h-40 mb-10">
                {/* Timeline bar */}
                <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                
                {/* Warm-up Phase */}
                <div className="absolute left-0 w-1/4 top-0 h-full flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FEF7CD] border-2 border-[#F0C000] flex items-center justify-center z-10 mb-2">
                    <Clock className="h-5 w-5 text-[#F0C000]" />
                  </div>
                  <div className="w-full h-2 bg-[#FEF7CD] absolute top-1/2 -translate-y-1/2 rounded-l-full"></div>
                  <div className="absolute top-14 w-24 text-center">
                    <h4 className="font-semibold text-[#F0C000] mb-1">Warm-Up</h4>
                    <p className="text-xs text-gray-600">Deposits allowed<br/>Withdrawals with fee</p>
                  </div>
                </div>
                
                {/* Active Phase */}
                <div className="absolute left-1/4 w-1/4 top-0 h-full flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#F2FCE2] border-2 border-[#6ABE39] flex items-center justify-center z-10 mb-2">
                    <Play className="h-5 w-5 text-[#6ABE39]" />
                  </div>
                  <div className="w-full h-2 bg-[#F2FCE2] absolute top-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-14 w-24 text-center">
                    <h4 className="font-semibold text-[#6ABE39] mb-1">Active</h4>
                    <p className="text-xs text-gray-600">Deposits allowed<br/>Borrowing active</p>
                  </div>
                </div>
                
                {/* Cooldown Phase */}
                <div className="absolute left-2/4 w-1/4 top-0 h-full flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#F1F0FB] border-2 border-[#9CA3AF] flex items-center justify-center z-10 mb-2">
                    <Pause className="h-5 w-5 text-[#9CA3AF]" />
                  </div>
                  <div className="w-full h-2 bg-[#F1F0FB] absolute top-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-14 w-24 text-center">
                    <h4 className="font-semibold text-[#9CA3AF] mb-1">Cooldown</h4>
                    <p className="text-xs text-gray-600">Borrowing paused<br/>Repayments only</p>
                  </div>
                </div>
                
                {/* Withdrawal Phase */}
                <div className="absolute left-3/4 w-1/4 top-0 h-full flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#D6BCFA] border-2 border-[#9b87f5] flex items-center justify-center z-10 mb-2">
                    <Download className="h-5 w-5 text-[#9b87f5]" />
                  </div>
                  <div className="w-full h-2 bg-[#D6BCFA] absolute top-1/2 -translate-y-1/2 rounded-r-full"></div>
                  <div className="absolute top-14 w-24 text-center">
                    <h4 className="font-semibold text-[#9b87f5] mb-1">Withdrawal</h4>
                    <p className="text-xs text-gray-600">LP tokens redeemable<br/>Final yield determined</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Phase Descriptions */}
            <div className="space-y-6">
              <div className="rounded-lg bg-[#FEF7CD]/30 p-6 border-l-4 border-[#F0C000]">
                <h3 className="text-xl font-semibold mb-2 text-[#F0C000] flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Warm-up Period
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Lenders can supply funds to the pool in exchange for LP tokens. Withdrawals are allowed, but a small fee applies to discourage spamming.
                </p>
              </div>
              
              <div className="rounded-lg bg-[#F2FCE2]/30 p-6 border-l-4 border-[#6ABE39]">
                <h3 className="text-xl font-semibold mb-2 text-[#6ABE39] flex items-center gap-2">
                  <Play className="h-5 w-5" /> Active Period
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Lenders can continue contributing funds, but withdrawals are no longer allowed. This is also when borrowers begin accessing the pool for loans.
                </p>
              </div>
              
              <div className="rounded-lg bg-[#F1F0FB]/30 p-6 border-l-4 border-[#9CA3AF]">
                <h3 className="text-xl font-semibold mb-2 text-[#9CA3AF] flex items-center gap-2">
                  <Pause className="h-5 w-5" /> Cooldown Period
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Borrowing is paused, and borrowers focus on repaying their outstanding loans. Lenders cannot contribute or withdraw during this time, allowing for a clear assessment of loan repayment outcomes and accurate calculation of final LP token value.
                </p>
              </div>
              
              <div className="rounded-lg bg-[#D6BCFA]/30 p-6 border-l-4 border-[#9b87f5]">
                <h3 className="text-xl font-semibold mb-2 text-[#9b87f5] flex items-center gap-2">
                  <Download className="h-5 w-5" /> Withdrawal Period
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  The pool reaches maturity. LP token prices have stabilized based on the pool's performance, and lenders can redeem their tokens to withdraw their original funds along with any accrued yield.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
              Risk Management
            </h2>
          </div>
          <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
            <p className="text-gray-700 mb-8 leading-relaxed">
              Magnify Cash is designed with strong safeguards to protect lenders and support responsible borrowing.
            </p>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border border-[#5A1A8F]/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75]"></div>
                <CardHeader>
                  <CardTitle className="text-xl">Identity Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    Borrowers can only access the platform through the World App and must complete World ID (ORB) verification, ensuring all borrowers are real, verified individuals.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-[#5A1A8F]/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75]"></div>
                <CardHeader>
                  <CardTitle className="text-xl">Loan Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    Each borrower is limited to one active loan at a time, regardless of how many liquidity pools exist.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-[#5A1A8F]/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75]"></div>
                <CardHeader>
                  <CardTitle className="text-xl">Default Consequences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    If a borrower defaults, they are blocked from accessing new loans across all pools until they repay their defaulted loan plus a defaulter's fee.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-[#5A1A8F]/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75]"></div>
                <CardHeader>
                  <CardTitle className="text-xl">Platform Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    Lenders are primarily encouraged to access the platform through the World App for a seamless in-app experience. However, access via MetaMask in browser is also supported for advanced users who prefer it.
                  </p>
                </CardContent>
              </Card>
            </div>
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
                  What are LP tokens and how do they work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  LP (Liquidity Provider) tokens represent your share of a specific pool. As borrowers repay their loans with yield, the value of each LP token increases. When the pool reaches the withdrawal phase, you can redeem your LP tokens for your original funds plus any earned yield.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What currencies can I use to lend?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Currently, Magnify Cash only supports lending in USD Coin (USDC). All deposits, repayments, and LP token values are denominated in USDC. Make sure your wallet is funded with USDC before attempting to contribute to a liquidity pool.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  Can I withdraw my funds before the pool ends?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  You can withdraw during the warm-up period, but a small fee applies to discourage spamming. Once the pool enters the active phase, withdrawals are locked until the withdrawal period at the end of the pool's lifecycle.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  How is the LP token price calculated?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  The LP token price reflects the performance of the pool. It starts at 1.0 and increases based on the repayments received from borrowers. At the end of the cooldown period, the price is finalized based on how much of the borrowed funds were repaid versus defaulted.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  When and how do I receive my yield?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Your yield is automatically included in the final value of your LP tokens. When the pool reaches the withdrawal phase, you can redeem your tokens to receive your funds plus yield in a single transaction.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What happens during the cooldown period?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  During cooldown, new borrowing stops. Borrowers focus on repaying their outstanding loans, while deposits and withdrawals are paused. This allows the system to finalize repayment outcomes and determine the final LP token value.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  Can I join a pool after it has already started?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes, you can contribute during both the warm-up and active periods. However, if you join during the active period instead of the warm-up, the LP token price may differ — which can affect your potential yield.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What happens if a pool doesn't attract enough borrowers?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  The pool will still run its full cycle. If fewer loans are issued, there may be less yield generated, which could result in slower LP token growth. However, your funds remain secure and will be returned during the withdrawal phase.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What happens if a borrower defaults?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Borrowers who default are immediately blocked from taking any new loans from any pool. They must repay the full amount of the defaulted loan plus a defaulter's fee to regain access. Defaults reduce the total amount repaid to the pool and will negatively impact the final LP token value.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  How does World ID verification reduce risk?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  All borrowers must verify their identity using World ID via Orb. This ensures each person can only borrow once at a time, and helps prevent abuse by fake or duplicate accounts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  Can I use MetaMask instead of the World App?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes. While the World App is the primary interface, you can also access Magnify via MetaMask using a web browser if you prefer.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-12" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  Do I need to pay gas fees when lending or withdrawing?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  No. When using the World App, transactions are gasless thanks to World's sponsored transaction system. This means users don't need to hold crypto or pay fees to interact with Magnify Cash inside the app.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-13" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  How long is each pool term?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Pool term lengths may vary and are determined by the team based on ongoing analysis. You can always view the specific term details for each pool before joining.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-14" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  Is there a minimum or maximum amount I can lend?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  There is no maximum limit — you can lend as much as you'd like. However, there is a minimum transaction amount of $0.10 USD, as required by the World App's payment system.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-15" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  Where can I get the latest updates on Magnify?
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

              <AccordionItem value="item-16" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  I&apos;ve encountered an issue. How can I get support?
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
