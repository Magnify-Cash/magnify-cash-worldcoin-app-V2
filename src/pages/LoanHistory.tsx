import { useEffect, useState } from "react";
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
import { BACKEND_URL } from "@/utils/constants";

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

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      const ls_wallet = localStorage.getItem("ls_wallet_address");
      if (!ls_wallet) {
        setError("Wallet address not found in localStorage.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${BACKEND_URL}/getTransactionHistory?wallet=${ls_wallet}`
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const data: LoanTransaction[] = await response.json();
  
        const sortedTransactions = data.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
  
        setTransactions(sortedTransactions);
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
                    <TableCell colSpan={3} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-red-500">
                      {error}
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
