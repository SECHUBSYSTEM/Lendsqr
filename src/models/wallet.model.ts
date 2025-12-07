export interface Wallet {
  id: number;
  user_id: number;
  balance: string | number;
  created_at: Date;
  updated_at: Date;
}

export interface WalletResponse {
  id: number;
  userId: number;
  balance: number;
  createdAt: Date;
}

export const toWalletResponse = (wallet: Wallet): WalletResponse => ({
  id: wallet.id,
  userId: wallet.user_id,
  balance:
    typeof wallet.balance === "string"
      ? parseFloat(wallet.balance)
      : wallet.balance,
  createdAt: wallet.created_at,
});
