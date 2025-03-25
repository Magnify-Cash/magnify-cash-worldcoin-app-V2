
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-white focus:text-white h-10 w-10"              >
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
                <svg
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <path
                    d="M3 5H11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M3 12H16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M3 19H21"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </button>
            </DropdownMenuTrigger>
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
                onClick={() => navigate("/verify-again")}
              >
                Verify Again
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
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
