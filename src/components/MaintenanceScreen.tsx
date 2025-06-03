import { Shield, Clock } from "lucide-react";
import { Header } from "@/components/Header";

const MaintenanceScreen = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Get a Loan" />
      
      <div className="p-6 space-y-6">
        <div className="flex-column justify-center items-center h-[calc(100vh-80px)]">
          <div className="glass-card p-8 text-center max-w-md mx-auto">
            <div className="mb-6">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <Shield className="w-8 h-8 mx-auto text-blue-500" />
            </div>
            
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Down for Maintenance
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our borrowing service is temporarily unavailable while we perform scheduled maintenance to improve your experience.
            </p>
            
            <p className="text-sm text-gray-500">
              We apologize for any inconvenience and appreciate your patience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScreen; 