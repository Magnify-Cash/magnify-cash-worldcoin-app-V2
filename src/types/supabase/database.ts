
import type { AIAgentMetric, ChatMessage, ChatConversation, ChatQuery } from './chat';
import type { DefiMarketData, DefiLlamaProtocol, DefiLlamaNews } from './defi';
import type { TokenMetadata, MagTokenAnalytics } from './token';
import type { LiquidityPool, UserPoolPosition } from './liquidity';
import type { MagRewards } from './rewards';
import type { Transaction, WalletBalance } from '../wallet';

export type AnnouncementType = 'new-feature' | 'security' | 'update' | 'announcement';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  type: AnnouncementType;
  action?: string | null;
  is_highlighted: boolean;
  is_new: boolean;
  created_at: string;
  created_by?: string | null;
}

export interface UserAnnouncementRead {
  id: string;
  user_id: string;
  announcement_id: number;
  read_at: string;
}

export interface Database {
  public: {
    Tables: {
      ai_agent_metrics: {
        Row: AIAgentMetric;
        Insert: Omit<AIAgentMetric, 'id' | 'created_at'>;
        Update: Partial<Omit<AIAgentMetric, 'id' | 'created_at'>>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at'>>;
      };
      chat_conversations: {
        Row: ChatConversation;
        Insert: Omit<ChatConversation, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatConversation, 'id' | 'created_at'>>;
      };
      chat_queries: {
        Row: ChatQuery;
        Insert: Omit<ChatQuery, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatQuery, 'id' | 'created_at'>>;
      };
      defi_market_data: {
        Row: DefiMarketData;
        Insert: Omit<DefiMarketData, 'id' | 'created_at'>;
        Update: Partial<Omit<DefiMarketData, 'id' | 'created_at'>>;
      };
      defi_llama_protocols: {
        Row: DefiLlamaProtocol;
        Insert: Omit<DefiLlamaProtocol, 'id' | 'created_at'>;
        Update: Partial<Omit<DefiLlamaProtocol, 'id' | 'created_at'>>;
      };
      defi_llama_news: {
        Row: DefiLlamaNews;
        Insert: Omit<DefiLlamaNews, 'id' | 'created_at'>;
        Update: Partial<Omit<DefiLlamaNews, 'id' | 'created_at'>>;
      };
      token_metadata: {
        Row: TokenMetadata;
        Insert: Omit<TokenMetadata, 'id' | 'created_at'>;
        Update: Partial<Omit<TokenMetadata, 'id' | 'created_at'>>;
      };
      mag_token_analytics: {
        Row: MagTokenAnalytics;
        Insert: Omit<MagTokenAnalytics, 'id' | 'created_at'>;
        Update: Partial<Omit<MagTokenAnalytics, 'id' | 'created_at'>>;
      };
      liquidity_pools: {
        Row: LiquidityPool;
        Insert: Omit<LiquidityPool, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LiquidityPool, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_pool_positions: {
        Row: UserPoolPosition;
        Insert: Omit<UserPoolPosition, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPoolPosition, 'id' | 'created_at' | 'updated_at'>>;
      };
      mag_rewards: {
        Row: MagRewards;
        Insert: Omit<MagRewards, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MagRewards, 'id' | 'created_at' | 'updated_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>;
      };
      wallet_balances: {
        Row: WalletBalance;
        Insert: Omit<WalletBalance, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WalletBalance, 'id' | 'created_at' | 'updated_at'>>;
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, 'id' | 'created_at'>;
        Update: Partial<Omit<Announcement, 'id' | 'created_at'>>;
      };
      user_announcement_reads: {
        Row: UserAnnouncementRead;
        Insert: Omit<UserAnnouncementRead, 'id' | 'read_at'>;
        Update: Partial<Omit<UserAnnouncementRead, 'id' | 'read_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
