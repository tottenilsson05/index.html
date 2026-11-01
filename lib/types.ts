export type Winner = {
  round_id: number;
  post_id: number;
  short_id: string | null;
  image_url: string;
  caption: string;
  x_handle: string | null;
  votes: number;
  prize_lamports: number | null;
  payout_status: 'pending' | 'paid' | 'nothing_due' | 'awaiting_fees';
  paid_lamports: number | null;
  tx_signature: string | null;
  created_at: string;
};

export type PublicState = {
  server_now: string;
  launched: boolean;
  launch_at: string | null;
  round_seconds: number;
  ca: string | null;
  pump_url: string | null;
  x_url: string | null;
  market_cap_usd: number | null;
  price_usd?: number | null;
  volume_24h_usd?: number | null;
  fees_total_lamports?: number | null;
  mcap_updated_at: string | null;
  mcap_source: string | null;
  fee_tracking: boolean;
  fee_updated_at: string | null;
  round: { id: number; starts_at: string; ends_at: string } | null;
  round_fee_lamports: number | null;
  total_paid_lamports: number;
  post_count: number;
  last_winner: Winner | null;
};

export type Post = {
  id: number;
  short_id: string | null;
  image_url: string;
  caption: string;
  x_handle: string | null;
  created_at: string;
};
