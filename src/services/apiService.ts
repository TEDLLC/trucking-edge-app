// src/services/apiService.ts

// Safe environment variable retrieval without requiring @types/node
const getEnvVar = (key: string, defaultValue: string): string => {
  // Check for Vite env vars (import.meta.env)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  // Check for process.env (CRA / Webpack)
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.[key]) {
    return (globalThis as any).process.env[key];
  }
  return defaultValue;
};

const API_BASE_URL = getEnvVar('VITE_API_URL', getEnvVar('REACT_APP_API_URL', 'https://api.yourlogisticsapp.com/v1'));
const WS_BASE_URL = getEnvVar('VITE_WS_URL', getEnvVar('REACT_APP_WS_URL', 'wss://api.yourlogisticsapp.com/ws'));

export interface AlertMessage {
  id: string;
  type: 'WARNING' | 'CRITICAL' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
}

class DispatchApiService {
  private socket: WebSocket | null = null;

  // Sync Load updates to backend
  async updateLoadStatus(loadId: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/loads/${loadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to update load status on backend:', error);
      return false;
    }
  }

  // Real-time WebSocket connection listener
  subscribeToAlerts(onAlertReceived: (alert: AlertMessage) => void) {
    try {
      this.socket = new WebSocket(WS_BASE_URL);

      this.socket.onmessage = (event) => {
        const data: AlertMessage = JSON.parse(event.data);
        onAlertReceived(data);
      };

      this.socket.onerror = () => {
        console.warn('WebSocket connection error, falling back to local simulation.');
      };
    } catch (e) {
      console.warn('WebSocket init failed');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export const apiService = new DispatchApiService();