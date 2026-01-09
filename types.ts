
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
  bm: string; // Matrícula
  rank: string; // Cargo/Posto
  name: string; // Nome Funcional
  code: string; // CÓD. Setor (Ex: G051)
  location: string; // PRÓPRIO / Localização
  cnh: string;
  status: 'ATIVO' | 'SEM PORTE';
  course: 'Vigente' | 'Pendente';
  pendency?: string;
  shift: string; // Turno
  schedule: string[]; // Array de status da escala (P, F, etc)
}

export interface Vehicle {
  plate: string;
  type: 'VTR' | 'MOTO' | 'VAN' | 'CAMINHONETE';
  model: string;
  status: 'DISPONÍVEL' | 'MANUTENÇÃO' | 'EM USO';
}

export interface ImportSnapshot {
  id: string;
  date: string;
  user: string;
  type: 'efetivo' | 'escala' | 'vtrs';
  count: number;
}
