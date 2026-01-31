export interface PIIResult {
  start: number;
  end: number;
  score: number;
  entity_type: string;
}

export interface AnonymizeResponse {
  text: string;
}

export interface AnalyzeRequest {
  text: string;
  language: string;
  score_threshold?: number;
}

export interface AnonymizeRequest {
  text: string;
  analyzer_results: PIIResult[];
  anonymizers: {
    DEFAULT: {
      type: string;
      new_value: string;
    };
  };
}

export type EntityType =
  | 'PERSON'
  | 'PHONE_NUMBER'
  | 'EMAIL_ADDRESS'
  | 'LOCATION'
  | 'DATE_TIME'
  | 'CREDIT_CARD'
  | 'IBAN_CODE'
  | 'IP_ADDRESS'
  | 'NRP'
  | 'URL'
  | 'US_SSN'
  | 'SSN'
  | 'US_PASSPORT'
  | 'UK_NHS'
  | 'IIN'
  | 'BIN'
  | 'ID_CARD';

export const ENTITY_TYPE_LABELS: Record<string, string> = {
  PERSON: 'Name',
  PHONE_NUMBER: 'Phone',
  EMAIL_ADDRESS: 'Email',
  LOCATION: 'Location',
  DATE_TIME: 'Date/Time',
  CREDIT_CARD: 'Credit Card',
  IBAN_CODE: 'IBAN',
  IP_ADDRESS: 'IP Address',
  NRP: 'Nationality',
  URL: 'URL',
  US_SSN: 'SSN (US)',
  SSN: 'SSN',
  US_PASSPORT: 'US Passport',
  UK_NHS: 'NHS Number',
  IIN: 'ИИН (Kazakhstan)',
  BIN: 'БИН (Kazakhstan)',
  ID_CARD: 'ID Card',
};

// Auth types
export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  last_login?: string;
  is_active?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getAccessToken: () => string | null;
}
