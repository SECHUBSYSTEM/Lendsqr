export type TransactionType = "fund" | "transfer" | "withdrawal";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  id: number;
  wallet_id: number;
  type: TransactionType;
  amount: string | number;
  reference: string;
  recipient_wallet_id: number | null;
  description: string | null;
  status: TransactionStatus;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionResponse {
  id: number;
  walletId: number;
  type: TransactionType;
  amount: number;
  reference: string;
  recipientWalletId: number | null;
  description: string | null;
  status: TransactionStatus;
  createdAt: Date;
}

export const toTransactionResponse = (
  txn: Transaction
): TransactionResponse => ({
  id: txn.id,
  walletId: txn.wallet_id,
  type: txn.type,
  amount: typeof txn.amount === "string" ? parseFloat(txn.amount) : txn.amount,
  reference: txn.reference,
  recipientWalletId: txn.recipient_wallet_id,
  description: txn.description,
  status: txn.status,
  createdAt: txn.created_at,
});
