import { useState, useEffect } from "react";
import { getNativeBalance } from "../services/freighter";
import { useAuth } from "../context/AuthContext";

export function useWalletBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.walletAddress) {
      setBalance(null);
      return;
    }

    // Initial fetch
    let mounted = true;
    
    async function fetchBalance() {
      if (!user?.walletAddress) return;
      const bal = await getNativeBalance(user.walletAddress);
      if (mounted) {
        setBalance(bal);
      }
    }
    
    fetchBalance();

    // Poll every 5 seconds for real-time updates
    const intervalId = setInterval(fetchBalance, 5000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [user?.walletAddress]);

  return balance;
}
