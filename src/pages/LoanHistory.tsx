import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { getTransactionHistory } from "@/lib/backendRequests";

interface LoanTransaction {
  transactionHash: string;
  blockNumber: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  status: "received" | "repaid";
}

const LoanHistory = () => {
  const [transactions, setTransactions] = useState<LoanTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      const ls_wallet = localStorage.getItem("ls_wallet_address");
      if (!ls_wallet) {
        setError("Wallet address not found in localStorage.");
        setLoading(false);
        return;
      }
  
      try {
        const data = await getTransactionHistory(ls_wallet);
  
        if (data.length === 0) {
          setError("You don't have any transaction history yet. Would you like to request your first loan?");
        } else {
          setTransactions(
            data
              .map((transaction) => ({
                ...transaction,
                status: transaction.status as "received" | "repaid",
              }))
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          );
        }
      } catch (err) {
        setError("Failed to fetch transactions.");
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTransactionHistory();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Loan History" />
      <main className="container px-4 py-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] text-left">Date</TableHead>
                  <TableHead className="text-left">Transaction Info</TableHead>
                  <TableHead className="text-left">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="dot-spinner">
                          <div className="dot bg-[#1A1E8E]"></div>
                          <div className="dot bg-[#4A3A9A]"></div>
                          <div className="dot bg-[#7A2F8A]"></div>
                          <div className="dot bg-[#A11F75]"></div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-red-500">
                      {error}
                      {error.includes("your first loan") && (
                        <Button onClick={() => navigate("/loan")} className="w-full mt-4">
                          Request a Loan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.transactionHash}>
                      <TableCell className="font-medium text-left">
                        {format(new Date(transaction.timestamp), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-left">
                        {transaction.status === "received"
                          ? "Received Loan"
                          : "Repaid Loan"}
                      </TableCell>
                      <TableCell
                        className={`text-left ${
                          transaction.status === "received"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.status === "received" ? "+" : "-"}$
                        {parseFloat(transaction.amount).toFixed(3)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoanHistory;