
import React from 'react';
import { ArrowLeft, Home, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigation } from "@/contexts/NavigationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export const Header = ({ title, showBack = true }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, setUserType } = useNavigation();
  
  const isLendingPage = location.pathname === "/lending";
  const isPoolPage = location.pathname.startsWith("/pool/");
  const isPortfolioPage = location.pathname === "/portfolio";
  const isLendingHistoryPage = location.pathname === "/lending-history";
  const isCalculatorPage = location.pathname === "/calculator";
  const isLenderGuidePage = location.pathname === "/lender-guide";
  const isLendingRelated = isLendingPage || isPoolPage || isPortfolioPage || isLendingHistoryPage || isCalculatorPage || isLenderGuidePage;

  // Set user type when entering specific flows
  React.useEffect(() => {
    if (isLendingRelated && userType !== 'lender') {
      setUserType('lender');
    } else if (location.pathname === "/loan" && userType !== 'borrower') {
      setUserType('borrower');
    }
  }, [location.pathname, setUserType]);

  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/welcome");
    }
  };

  const renderLenderMenu = () => (
    <DropdownMenuContent
      align="end"
      className="w-56 bg-white/95 backdrop-blur-sm"
    >
      <DropdownMenuLabel>Lending Navigation</DropdownMenuLabel>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/welcome")}
      >
        <Home className="mr-2 h-4 w-4" />
        Welcome
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/lending")}
      >
        Dashboard
      </DropdownMenuItem>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/portfolio")}
      >
        Portfolio
      </DropdownMenuItem>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/lending-history")}
      >
        History
      </DropdownMenuItem>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/calculator")}
      >
        Yield Calculator
      </DropdownMenuItem>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/announcements")}
      >
        Announcements
      </DropdownMenuItem>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/lender-guide")}
      >
        Help Center
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  const renderBorrowerMenu = () => (
    <DropdownMenuContent
      align="end"
      className="w-56 bg-white/95 backdrop-blur-sm"
    >
      <DropdownMenuLabel>Quick Access</DropdownMenuLabel>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/welcome")}
      >
        <Home className="mr-2 h-4 w-4" />
        Welcome
      </DropdownMenuItem>

      <DropdownMenuLabel>Finance</DropdownMenuLabel>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/wallet")}
      >
        Wallet
      </DropdownMenuItem>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/loan")}
      >
        Get a Loan
      </DropdownMenuItem>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/repay-loan")}
      >
        Loan Status
      </DropdownMenuItem>
      <DropdownMenuSeparator />

      <DropdownMenuLabel>Account</DropdownMenuLabel>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/profile")}
      >
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/loan-history")}
      >
        Loan History
      </DropdownMenuItem>
      <DropdownMenuSeparator />

      <DropdownMenuLabel>Support</DropdownMenuLabel>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/announcements")}
      >
        Announcements
      </DropdownMenuItem>
      <DropdownMenuItem
        className="min-h-[40px] focus:text-white focus-visible:text-white"
        onClick={() => navigate("/guide")}
      >
        Help Center
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between w-full">
          {showBack ? (
            <button
              onClick={handleBackClick}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-white focus:text-white h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}

          <h1 className="text-base sm:text-lg font-semibold truncate max-w-[200px] sm:max-w-none">
            {title}
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-white h-10 w-10">
                <Menu className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            {userType === 'lender' ? renderLenderMenu() : renderBorrowerMenu()}
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
