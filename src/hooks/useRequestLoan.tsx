
import { useCallback, useState } from "react";
import { useDemoRequestLoan } from "./useDemoMagnifyWorld";

const useRequestLoan = () => {
  // Use the demo hook implementation instead
  const demoHook = useDemoRequestLoan();
  
  // Return the same interface as the original hook
  return demoHook;
};

export default useRequestLoan;
