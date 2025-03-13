
/**
 * Mock API service to replace actual API calls to blockchain or verification services
 * This allows the demo to work without requiring World App or any real blockchain interaction
 */

/**
 * Mock function to simulate verifying identity
 */
export const verifyWorldId = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    verified: true,
    message: "Demo verification successful"
  };
};

/**
 * Mock function to simulate getting wallet balance
 */
export const getWalletBalance = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    success: true,
    balance: 125.75,
    currency: "USDC"
  };
};

/**
 * Mock function to simulate requesting a loan
 */
export const requestLoan = async (amount: number) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Add to mock active loans in localStorage
  const activeLoanString = localStorage.getItem("active_loans");
  const activeLoans = activeLoanString ? JSON.parse(activeLoanString) : [];
  
  const newLoan = {
    id: `loan${Date.now()}`,
    amount: amount,
    interestRate: 0.05,
    startDate: Date.now(),
    dueDate: Date.now() + 86400000 * 30, // 30 days from now
    status: "active"
  };
  
  activeLoans.push(newLoan);
  localStorage.setItem("active_loans", JSON.stringify(activeLoans));
  
  return {
    success: true,
    loanId: newLoan.id,
    amount: amount,
    message: "Demo loan approved successfully"
  };
};

/**
 * Mock function to simulate repaying a loan
 */
export const repayLoan = async (loanId: string, amount: number) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update mock active loans in localStorage
  const activeLoanString = localStorage.getItem("active_loans");
  let activeLoans = activeLoanString ? JSON.parse(activeLoanString) : [];
  
  // Find and update the loan
  activeLoans = activeLoans.map(loan => {
    if (loan.id === loanId) {
      return {
        ...loan,
        status: "repaid",
        repaymentDate: Date.now()
      };
    }
    return loan;
  });
  
  localStorage.setItem("active_loans", JSON.stringify(activeLoans));
  
  // Add to transaction history
  const transactionHistoryString = localStorage.getItem("transaction_history");
  const transactionHistory = transactionHistoryString ? JSON.parse(transactionHistoryString) : [];
  
  transactionHistory.push({
    id: `tx${Date.now()}`,
    type: "repayment",
    amount: amount,
    timestamp: Date.now(),
    status: "completed",
    loanId: loanId
  });
  
  localStorage.setItem("transaction_history", JSON.stringify(transactionHistory));
  
  return {
    success: true,
    message: "Demo loan repaid successfully"
  };
}; 
