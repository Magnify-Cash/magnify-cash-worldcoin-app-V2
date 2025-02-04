import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { User, DollarSign, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { LoanCard } from "@/components/LoanCard";

const Dashboard = () => {
  const navigate = useNavigate();

  const idCollaterals = [
    {
      title: "World ID",
      amount: "$1",
      interest: "2% APR",
      duration: "30 days",
      icon: "world" as const
    },
    {
      title: "Passport Credential",
      amount: "$5",
      interest: "2% APR",
      duration: "30 days",
      icon: "passport" as const
    },
    {
      title: "Orb Scan",
      amount: "$10",
      interest: "2% APR",
      duration: "30 days",
      icon: "orb" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Dashboard" />
      
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* User Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-center mb-6">
            <User className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-3 text-center">@Tytan</h2>
          <p className="text-muted-foreground text-center text-lg">Verified User</p>
        </motion.div>

        {/* Loan Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-primary" />
            Loan Status
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-secondary/5 hover:bg-secondary/10 dark:bg-secondary/10 dark:hover:bg-secondary/20 rounded-xl transition-colors duration-300">
              <div className="space-y-1">
                <p className="text-xl font-semibold">Active Loan</p>
                <p className="text-muted-foreground">Collateralized by World ID</p>
              </div>
              <button 
                onClick={() => navigate("/loan")}
                className="glass-button transform hover:scale-105 transition-transform duration-300"
              >
                View Details
              </button>
            </div>
          </div>
        </motion.div>

        {/* ID Vault Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Available ID Collaterals
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {idCollaterals.map((collateral, index) => (
              <motion.div
                key={collateral.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <LoanCard {...collateral} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;