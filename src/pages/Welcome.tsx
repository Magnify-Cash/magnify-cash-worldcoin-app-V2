
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDemoData } from "@/providers/DemoDataProvider";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Wallet, ChevronDown, RefreshCw } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const { connectWallet, isConnected, walletAddress, resetDemoData } = useDemoData();
  const [scrolled, setScrolled] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleConnect = () => {
    connectWallet();
    navigate("/guide");
  };

  const handleAlreadyConnected = () => {
    navigate("/profile");
  };

  const handleShowReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.shiftKey && e.altKey) {
      setShowReset(true);
    }
  };

  const handleReset = () => {
    resetDemoData();
    setShowReset(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="font-semibold text-slate-800">Magnify World</span>
          </div>
          
          {isConnected ? (
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={handleAlreadyConnected}
            >
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">
                {walletAddress ? `${walletAddress?.substring(0, 6)}...${walletAddress?.substring(walletAddress.length - 4)}` : "Connected"}
              </span>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="hover:bg-blue-50"
              onClick={handleConnect}
            >
              Connect
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        className="pt-32 pb-20 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="inline-block text-blue-600 font-medium text-sm px-3 py-1 rounded-full bg-blue-50 mb-4">
              Demo Mode
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Get undercollateralized loans with your World ID
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Magnify World leverages your World ID verification to provide loans based on your identity verification level.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg text-lg font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                  onClick={handleAlreadyConnected}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2" />
                </Button>
              ) : (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg text-lg font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                  onClick={handleConnect}
                >
                  Connect Wallet
                  <Wallet className="ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-medium">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">How Magnify World Works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-10 h-10 text-blue-500" />,
                title: "Verify Identity",
                description: "Use World ID to verify your identity and unlock loan tiers based on your verification level."
              },
              {
                icon: <Wallet className="w-10 h-10 text-blue-500" />,
                title: "Get a Loan",
                description: "Borrow USDC based on your verification tier without needing to provide full collateral."
              },
              {
                icon: <RefreshCw className="w-10 h-10 text-blue-500" />,
                title: "Repay & Build Credit",
                description: "Repay your loans to build credit history and unlock better terms for future loans."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="card-3d bg-slate-50 rounded-xl p-6 flex flex-col items-center text-center"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.2, duration: 0.5 }}
              >
                <div className="mb-4 p-3 bg-blue-50 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-medium">Verification Tiers</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Choose Your Verification Level</h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
              Higher verification levels unlock larger loan amounts and better interest rates.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Device",
                amount: "$1",
                interest: "2.5%",
                period: "30 days",
                description: "Basic verification with your device",
                featured: false
              },
              {
                name: "Passport",
                amount: "$5",
                interest: "2.0%",
                period: "60 days",
                description: "Enhanced verification with ID",
                featured: true
              },
              {
                name: "ORB",
                amount: "$10",
                interest: "1.5%",
                period: "90 days",
                description: "Premium verification with World ID ORB",
                featured: false
              }
            ].map((tier, index) => (
              <motion.div
                key={index}
                className={`rounded-xl overflow-hidden shadow-lg ${
                  tier.featured 
                    ? "border-2 border-blue-500 relative transform md:-translate-y-4" 
                    : "border border-slate-200"
                }`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.2, duration: 0.5 }}
              >
                {tier.featured && (
                  <div className="bg-blue-500 text-white text-sm font-medium py-1 text-center">
                    Most Popular
                  </div>
                )}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-slate-900">{tier.amount}</span>
                    <span className="text-slate-600 ml-1">loan</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                      {tier.interest} interest rate
                    </li>
                    <li className="flex items-center text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                      {tier.period} loan period
                    </li>
                    <li className="flex items-center text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                      {tier.description}
                    </li>
                  </ul>
                  <Button 
                    variant={tier.featured ? "default" : "outline"}
                    className={`w-full ${
                      tier.featured ? "bg-blue-500 hover:bg-blue-600" : "text-slate-800"
                    }`}
                    onClick={handleConnect}
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-medium">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "How does Magnify World verify my identity?",
                answer: "Magnify World uses World ID technology to verify your identity through your device, passport, or in-person ORB verification."
              },
              {
                question: "What determines my loan amount?",
                answer: "Your loan amount is determined by your verification tier. Higher verification tiers unlock larger loan amounts and better terms."
              },
              {
                question: "How do I repay my loan?",
                answer: "You can repay your loan directly through the app using USDC. The repayment includes the principal amount plus the accrued interest."
              },
              {
                question: "What happens if I don't repay my loan?",
                answer: "Failure to repay your loan will affect your credit score in the Magnify World ecosystem and may limit your ability to get future loans."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="border border-slate-200 rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                <details className="group">
                  <summary className="flex justify-between items-center p-4 cursor-pointer">
                    <h3 className="text-lg font-medium text-slate-800">{faq.question}</h3>
                    <ChevronDown className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-900 text-slate-300">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="font-semibold text-white" onClick={handleShowReset}>Magnify World</span>
            </div>
            
            <div className="text-sm">
              &copy; {new Date().getFullYear()} Magnify World. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Reset Modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-80 p-4">
            <h3 className="text-lg font-bold mb-4">Reset Demo Data</h3>
            <p className="text-sm text-slate-600 mb-4">
              This will reset all demo data and return to the initial state.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowReset(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Welcome;
