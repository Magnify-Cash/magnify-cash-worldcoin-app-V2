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
      // Add other necessary fields
    }));
  }

  // Set mock wallet address if not already present
  if (!localStorage.getItem("ls_wallet_address")) {
    localStorage.setItem("ls_wallet_address", "0xMockWalletAddress123456789");
  }

  // Set mock transaction history if needed
  if (!localStorage.getItem("transaction_history")) {
    localStorage.setItem("transaction_history", JSON.stringify([
      {
        id: "tx1",
        type: "deposit",
        amount: 100,
        timestamp: Date.now() - 86400000 * 7, // 7 days ago
        status: "completed"
      },
      {
        id: "tx2",
        type: "loan",
        amount: 50,
        timestamp: Date.now() - 86400000 * 3, // 3 days ago
        status: "completed"
      }
    ]));
  }

  // Set mock loan data if needed
  if (!localStorage.getItem("active_loans")) {
    localStorage.setItem("active_loans", JSON.stringify([
      {
        id: "loan1",
        amount: 50,
        interestRate: 0.05,
        startDate: Date.now() - 86400000 * 3, // 3 days ago
        dueDate: Date.now() + 86400000 * 27, // 27 days from now
        status: "active"
      }
    ]));
  }

  console.log("Mock user data initialized successfully");
}; 