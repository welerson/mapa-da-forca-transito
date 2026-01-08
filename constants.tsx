
import React from 'react';

export const STATUS_COLORS: Record<string, string> = {
  'P': 'bg-green-500 text-white',
  'T': 'bg-slate-400 text-white',
  'D': 'bg-amber-500 text-white',
  'F': 'bg-red-500 text-white',
  'AT': 'bg-blue-600 text-white',
  'FE': 'bg-purple-700 text-white',
};

export const STATUS_LABELS: Record<string, string> = {
  'P': 'Presença',
  'T': 'Permuta',
  'D': 'Dispensa',
  'F': 'Falta',
  'AT': 'Atestado',
  'FE': 'Férias',
};

export const RANKS = [
  'Gerente',
  'Inspetor',
  'Subinspetor',
  'GCD I',
  'GCD II',
  'GCM I',
  'GCM II',
  'GCM III'
];
