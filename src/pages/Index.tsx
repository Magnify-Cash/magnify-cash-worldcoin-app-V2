
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text animate-gradient">
            Welcome to Magnify Cash
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Decentralized loans powered by World ID identity verification. 
            Borrow without collateral, backed by your digital presence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/welcome')}
              className="glass-button flex items-center justify-center gap-2 py-3 px-8 text-base"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => navigate('/lending')}
              className="flex items-center justify-center gap-2 py-3 px-8 rounded-xl 
                        border border-gray-200 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#D946EF] 
                        text-white hover:opacity-90 transition-all duration-300 font-medium text-base"
            >
              Explore Lending
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Identity-Based Loans</h3>
              <p className="text-gray-600">Get loans based on your verified World ID, no collateral required.</p>
            </div>
            
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Earn as a Lender</h3>
              <p className="text-gray-600">Supply liquidity to the protocol and earn interest on your assets.</p>
            </div>
            
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Powered by $MAG</h3>
              <p className="text-gray-600">The protocol's governance token with staking rewards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
