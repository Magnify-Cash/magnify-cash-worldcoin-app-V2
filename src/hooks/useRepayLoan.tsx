
import { useCallback, useState } from "react";
import { useDemoRepayLoan } from "./useDemoMagnifyWorld";

const useRepayLoan = () => {
  // Use the demo hook implementation instead
  const demoHook = useDemoRepayLoan();
  
  // Return the same interface as the original hook
  return demoHook;
};

export default useRepayLoan;
