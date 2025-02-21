
import { Header } from "@/components/Header";
import { LoanCard } from "@/components/LoanCard";
import { useNavigate } from "react-router-dom";
import { ChevronUp, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
                Use World ID to verify your identity and access loans tailored to your
                verification level:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <LoanCard
                  title="DEVICE"
                  amount="$1"
                  interest="2%"
                  duration="30 days"
                  icon="world"
                />
                <LoanCard
                  title="PASSPORT (Coming Soon)"
                  amount="$5"
                  interest="2%"
                  duration="60 days"
                  icon="passport"
                />
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
                    💡 Tip: Verifying with ORB unlocks the highest loan limits and exclusive perks!
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
                2. Apply for a Loan
              </h2>
              <p className="text-gray-600 mb-6">
                Choose your loan amount and duration based on your verification level
              </p>
              <div className="glass-card p-4 border-l-4 border-[#5A1A8F] bg-gradient-to-r from-[#5A1A8F]/5 to-transparent">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#5A1A8F] flex-shrink-0 mt-1" />
                  <p className="text-gray-600">
                    💡 Tip: Start small with a $1 loan if you're new to Magnify Cash, and
                    increase your limits as you verify further.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
                3. Track & Repay
              </h2>
              <p className="text-gray-600 mb-6">
                Easily monitor your active loans and make repayments directly through
                your wallet:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 ml-4 space-y-2">
                <li>View your loan details, repayment schedule, and status.</li>
              </ul>
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
            FAQ
          </h1>
          <div className="glass-card p-8 hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] transition-all duration-300">
            <Accordion type="single" collapsible className="space-y-4">
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
                  If you default on your loan, you will lose the ability to repay it. Defaulting also means you will no longer be eligible to apply for new loans. To avoid this, ensure you repay your loans on time! For current defaulters who wish to continue borrowing in the future, stay tuned for further updates.
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

              <AccordionItem value="item-7" className="border-b border-gray-200">
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
