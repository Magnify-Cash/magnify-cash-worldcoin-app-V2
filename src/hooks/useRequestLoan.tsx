
import React, { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { USDC_ADDRESS, MAGNIFY_ADDRESS } from '@/utils/constants';
import { MagnifyWorldABI } from '@/utils/magnifyworldabi';

export const useRequestLoan = () => {
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const requestLoan = async () => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const tx = await writeContractAsync({
        abi: MagnifyWorldABI,
        address: MAGNIFY_ADDRESS,
        functionName: 'requestLoan',
        args: [],
      });

      toast({
        title: 'Success',
        description: 'Your loan request has been submitted. Transaction hash: ' + tx,
      });

      return tx;
    } catch (error) {
      console.error('Error requesting loan:', error);
      toast({
        title: 'Error',
        description: 'Failed to request loan. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    requestLoan,
    loading,
  };
};
