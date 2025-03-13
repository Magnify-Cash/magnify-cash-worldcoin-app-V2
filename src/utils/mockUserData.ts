
/**
 * Utility functions to initialize mock user data for the non-authenticated version
 * of the application.
 */

// Check if demo mode is enabled via environment variable
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

/**
 * Initializes mock user profile data in localStorage
 */
export const initializeMockUserData = () => {
  // Only initialize if in demo mode
  if (!isDemoMode) return;

  // Set mock user profile data if not already present
  if (!localStorage.getItem("user_profile")) {
    localStorage.setItem("user_profile", JSON.stringify({
      name: "Demo User",
      email: "demo@example.com",
      verified: true,
      kycStatus: "verified",
      worldId: "0xMockWorldId123456789",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  // Set mock wallet address if not already present
  if (!localStorage.getItem("ls_wallet_address")) {
    localStorage.setItem("ls_wallet_address", "0xMockWalletAddress123456789");
  }

  // Set mock username if not already present
  if (!localStorage.getItem("ls_username")) {
    localStorage.setItem("ls_username", "DemoUser");
  }

  // Set mock wallet balance if not already present
  if (!localStorage.getItem("wallet_balance")) {
    localStorage.setItem("wallet_balance", JSON.stringify({
      usdc: 100,
      mag: 500,
      eth: 0.5
    }));
  }

  console.log("Mock user data initialized successfully");
};

/**
 * Clears mock user data from localStorage
 */
export const clearMockUserData = () => {
  localStorage.removeItem("user_profile");
  localStorage.removeItem("ls_wallet_address");
  localStorage.removeItem("ls_username");
  localStorage.removeItem("wallet_balance");
  localStorage.removeItem("active_loans");
  localStorage.removeItem("transaction_history");
  localStorage.removeItem("demoData");
  
  console.log("Mock user data cleared successfully");
};
