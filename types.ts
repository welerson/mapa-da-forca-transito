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
  id: string; // BM
  rank: string; // Cargo
  name: string; // Nome Funcional
  code: string; // CÓD. (Ex: G051)
  location: string; // PRÓPRIO
  scale: string; // ESCALA
  shift: string; // TURNO
  status: 'ATIVO' | 'SEM PORTE';
  cnh: string;
  course: 'Vigente' | 'Pendente';
  pendency?: string;
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