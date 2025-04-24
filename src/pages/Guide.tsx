
import { Header } from "@/components/Header";
import { LoanCard } from "@/components/LoanCard";
import { useNavigate } from "react-router-dom";
import { ChevronUp, Info, AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const Guide = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative bg-white">
      <Header title="Help Center" />
      
      <div className="p-6 text-left max-w-4xl mx-auto">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
            How to Use Magnify Cash
          </h1>

          <div className="space-y-8">
            <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
                1. Verify Your Identity
              </h2>
              <p className="text-gray-600 mb-6">
                Use World ID to verify your identity and access loans
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <LoanCard
                  title="ORB"
                  amount="$10"
                  interest="1%"
                  duration="90 days"
                  icon="orb"
                />
              </div>

              <div className="glass-card p-4 border-l-4 border-[#5A1A8F] bg-gradient-to-r from-[#5A1A8F]/5 to-transparent">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#5A1A8F] flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    💡 Tip: Verifying with ORB ensures our loans go out to a verified human!
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
                2. Apply for a Loan
              </h2>
                <p className="text-gray-600 mb-6">
                Navigate to the &lsquo;Get a Loan&rsquo; page and apply for a loan!
                </p>
              <div className="glass-card p-4 border-l-4 border-[#5A1A8F] bg-gradient-to-r from-[#5A1A8F]/5 to-transparent">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#5A1A8F] flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    💡 Tip: Stay tuned for further updates where we introduced larger loan amounts!
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
                3. Track & Repay
              </h2>
              <p className="text-gray-600 mb-6">
                Easily monitor your active loan and make repayments directly from your wallet via the &lsquo;Loan Status&rsquo; page
              </p>
              <div className="glass-card p-4 border-l-4 border-[#5A1A8F] bg-gradient-to-r from-[#5A1A8F]/5 to-transparent">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#5A1A8F] flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    💡 Tip: Repaying early helps build trust and unlocks access to larger
                    loans over time!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
      </section>

        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
            FAQ
          </h1>
          <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
            <Accordion type="single" collapsible className="space-y-4">
              {/* Moved these items to the top as requested */}
              <AccordionItem value="item-9" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  I was previously device-verified, but now I can&apos;t apply for new loans. Why?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                We have updated our eligibility criteria to offer loans exclusively to Orb-verified users. This change ensures that every borrower is a real, unique human, as Orb verification provides a higher level of identity assurance. Unfortunately, device verification does not offer the same level of certainty, meaning we cannot reliably distinguish between real users and potential fraudulent accounts. By serving only Orb-verified users, we can maintain a fair and secure lending environment for everyone.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-10" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What's different about borrowing in V3?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  In previous versions, there was just one perpetual pool for all borrowers. In V3, you can choose from multiple liquidity pools, each with different terms — like loan amount, interest rate, and loan duration. You decide which pool to borrow from based on what's available and what best fits your needs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  I already claimed an NFT before — why do I need to claim it again in V3?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  With the launch of V3, Magnify Cash uses a new borrower NFT to support updated borrowing logic. Even if you claimed an NFT in V1 or V2, you'll need to claim the new V3 borrower NFT to continue borrowing. This NFT still verifies your ORB status via World ID and is required to unlock borrowing in V3. You can claim it from the Profile page of the Magnify Cash app. Claiming is quick and only needs to be done once.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-12" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What is the origination fee, and how does it affect my loan?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  An origination fee is a small percentage taken upfront when your loan is issued. For example, if you borrow 1 USDC with a 1% origination fee, you'll receive 0.99 USDC — but you'll still repay the full 1 USDC plus interest.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-13" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  I have an existing loan from V1 or V2 — can I borrow in V3?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  If you currently have an active or defaulted loan from V1 or V2, you won't be able to borrow in V3 until that loan is fully resolved.
                  
                  <div className="mt-2 space-y-4">
                    <p className="flex items-start">
                      <span className="text-green-500 font-bold mr-2">✅</span> 
                      <span>If your loan is still active, you'll need to repay it in full before accessing any V3 liquidity pools.</span>
                    </p>
                    
                    <p className="flex items-start">
                      <span className="text-red-500 font-bold mr-2">❌</span> 
                      <span>If your loan was defaulted, your borrowing access is currently locked.</span>
                    </p>
                  </div>
                  
                  <p className="mt-4">
                    We're working on a path to bring V1/V2 defaulters back into the system. You may be able to unlock borrowing again by paying a re-entry fee in the future. More details will be shared soon in the app and on our social channels.
                  </p>
                  
                  <p className="mt-2">
                    <strong>Note:</strong> All borrowers — including those returning from V1/V2 — must also claim the new V3 borrower NFT from the Profile page in the Magnify Cash app before borrowing.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Original FAQ items continue below */}
              <AccordionItem value="item-1" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  How many loans can I apply for at a time?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Currently you can only apply for one loan at a time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What happens if I don't repay my loan before the due date?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  If you miss your repayment deadline, your loan will be marked as defaulted. When this happens:
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>You will be blocked from taking any new loans from any liquidity pool.</li>
                    <li>To regain borrowing access, you must repay the full overdue loan plus a defaulter fee.</li>
                    <li>The default may negatively affect the value of LP tokens held by lenders in that pool.</li>
                    <li>Timely repayment helps maintain your access to future loans and supports a healthy lending environment for everyone.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What currencies are supported for loans on the app?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  We currently only provide loans in USDc.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  Can I repay my loan with a currency other than USDc?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  No, loans can only be repaid using USDc. Other currencies are currently not supported for loan repayment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors">
                  What is an NFT collateral?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  When you first verify your identity on the app, Magnify Cash mints a unique NFT for you! This NFT comes with several tiers that represent your verification level. It also serves as collateral whenever you apply for a loan. You can check the collateral availability of your NFT on your Profile page.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold hover:text-[#5A1A8F] transition-colors text-center w-full flex justify-center">
                  What is $MAG?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  $MAG is the native token of Magnify Cash, available on both Base and Mainnet.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border-b border-gray-200">
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

              <AccordionItem value="item-8" className="border-b border-gray-200">
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

export default Guide;
