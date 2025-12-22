
export enum PlanType {
  FREE = 'free',
  PREMIUM = 'premium'
}

export interface CheckoutAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  cpf: string; 
  // Allow address to be a structured object or a string for backward compatibility
  address?: CheckoutAddress | string; 
  avatar_url?: string;
  plan: PlanType;
  plan_start_date?: string;
  plan_renewal_date?: string;
  is_admin: boolean;
  is_permanent_premium?: boolean;
  created_at?: string;
  updated_at?: string;
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  PAYMENT = 'payment',
  PJ = 'pj'
}

export interface Account {
  id: string;
  user_id: string;
  account_type: AccountType;
  institution_name: string;
  institution_logo?: string;
  balance: number;
  balance_date?: string;
  created_at: string;
  updated_at: string;
}

export enum CardBrand {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  ELO = 'elo',
  AMEX = 'amex',
  OTHER = 'other' 
}

export interface CreditCard {
  id: string;
  user_id: string;
  last_four_digits: string;
  issuer_bank: string; 
  card_brand: CardBrand;
  limit_amount: number;
  limit_date?: string;
  due_day: number;
  closing_day: number;
  closing_offset: number; 
  background_gradient?: string;
  created_at: string;
  updated_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  icon?: string;
  created_at: string;
  updated_at?: string;
}

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  RECEIVE = 'receive'
}

export interface Transaction {
  id: string;
  user_id?: string;
  type: TransactionType;
  date: string;
  description: string;
  amount: number;
  category: string;
  account_id?: string;
  credit_card_id?: string;
  installment_number?: number;
  total_installments?: number;
  is_paid?: boolean;
  created_at?: string;
  updated_at?: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface Payment {
  id: string;
  user_id: string;
  mercado_pago_id?: string;
  amount: number;
  status: PaymentStatus;
  plan: PlanType;
  created_at: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: any; 
  path: string;
  premiumOnly?: boolean;
}
