import { Guest, RequestStatus, ScanResult } from '../types';

/**
 * Helper per effettuare chiamate API
 */
const apiCall = async <T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> => {
  try {
    // 1. Recupera la password dalla memoria del browser
    const token = sessionStorage.getItem('russoloco_admin_auth') || '';

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-admin-password': token // <--- ECCO LA CHIAVE MANCANTE!
    };

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    // La chiamata va all'endpoint locale del server Node
    const response = await fetch(`/api/${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
          // Se la password è sbagliata o scaduta
          console.error("Non autorizzato o password errata");
          // Opzionale: puoi forzare il logout se vuoi
          // sessionStorage.removeItem('russoloco_admin_auth');
          // window.location.reload();
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Errore API: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) return null as T;

    return await response.json();
  } catch (error) {
    console.error(`Errore nella chiamata a ${endpoint}:`, error);
    throw error;
  }
};

// ... Le altre funzioni sotto (getGuests, createRequest, etc.) restano uguali ...
export const getGuests = async (): Promise<Guest[]> => {
  return await apiCall<Guest[]>('guests');
};
// (Assicurati che il resto del file sia presente)
export const createRequest = async (guestData: Omit<Guest, 'id' | 'status' | 'isUsed' | 'createdAt'>): Promise<void> => {
  await apiCall('register', 'POST', guestData);
};

export const approveRequest = async (id: string): Promise<Guest | null> => {
  const response = await apiCall<{ success: boolean, guest: Guest }>('approve', 'POST', { id });
  return response.guest;
};

export const rejectRequest = async (id: string): Promise<void> => {
  await apiCall('reject', 'POST', { id });
};

export const scanQRCode = async (qrContent: string): Promise<ScanResult> => {
  try {
      return await apiCall<ScanResult>('scan', 'POST', { qrContent });
  } catch (error) {
      return {
          valid: false,
          message: 'ERRORE DI RETE',
          type: 'error'
      };
  }
};

export const resetData = async (): Promise<void> => {
  await apiCall('reset', 'POST');
};