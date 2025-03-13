
/**
 * Utility functions to initialize mock user data for the non-authenticated version
 * of the application.
 */

/**
 * Initializes mock user profile data in localStorage
 */
export const initializeMockUserData = () => {
  // Set mock user profile data if not already present
  if (!localStorage.getItem("user_profile")) {
    localStorage.setItem("user_profile", JSON.stringify({
      name: "Demo User",
      email: "demo@example.com",
      verified: true,
      kycStatus: "verified",
      worldId: "0xMockWorldId123456789",
    }));
  }

  // Set mock wallet address if not already present
  if (!localStorage.getItem("ls_wallet_address")) {
    localStorage.setItem("ls_wallet_address", "0xMockWalletAddress123456789");
  }

  // Set mock username if not already present
  if (!localStorage.getItem("ls_username")) {
    localStorage.getItem("ls_username") || localStorage.setItem("ls_username", "DemoUser");
  }

  console.log("Mock user data initialized successfully");
};
