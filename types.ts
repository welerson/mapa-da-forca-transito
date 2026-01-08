
export enum UserRole {
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

export type PresenceStatus = 'P' | 'T' | 'D' | 'F' | 'AT' | 'FE' | null;

export interface Agent {
  id: string; // BM - Badge Number
  rank: string; // Cargo (GCD I, GCD II, Subinspetor, etc.)
  name: string; // Nome Funcional
  code: string; // CÓD. (G051, G052, etc.)
  location: string; // PRÓPRIO
  scale: string; // ESCALA (12X36-D1, 5X2, etc.)
  startTime: string; // INÍCIO
  endTime: string; // FIM
  email: string;
  phone: string;
  gt?: string; // Group/Team
  activeStatus?: 'ATIVO' | 'SEM PORTE'; // PORTE
  cnhCategory?: string; // CNH
  certified?: boolean; // CREDENCIADO
  cveCourseStatus?: string; // CURSO CVE
  pendency?: string; // PENDÊNCIA
}

export interface DailySchedule {
  date: string; // ISO string YYYY-MM-DD
  agentId: string;
  status: PresenceStatus;
}

export interface Vehicle {
  id: string;
  type: 'VTR' | 'MOTO' | 'VAN' | 'CAMINHONETE';
  brandModel: string;
  plate: string;
}

export interface ForceSummary {
  code: string;
  name: string;
  category: 'SUPORTE OPERACIONAL' | 'EQUIPE OPERACIONAL' | 'PROCESSAMENTO AUTO INFRAÇÃO';
  ranks: {
    [rank: string]: number;
  };
  total: number;
}

export interface ImportSnapshot {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  description: string;
  agentCount: number;
}
