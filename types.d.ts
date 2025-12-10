export interface Env {
  DATABASE_URL: string;
  RESEND_API_KEY: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  instagram: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  qrCode?: string;
  isUsed: boolean;
  usedAt?: number;
  createdAt: number;
}