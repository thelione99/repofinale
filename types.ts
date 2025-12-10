export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  instagram: string;
  email: string;
  status: RequestStatus;
  qrCode?: string; // The content of the QR code (usually the ID)
  isUsed: boolean;
  usedAt?: number; // Timestamp
  createdAt: number;
}

export interface ScanResult {
  valid: boolean;
  guest?: Guest;
  message: string;
  type: 'success' | 'error' | 'warning';
}