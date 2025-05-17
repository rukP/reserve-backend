export type Role = 'USER' | 'ADMIN';

export type SlotStatus = 'AVAILABLE' | 'LIMITED_TIME' | 'UNAVAILABLE';

export interface TokenPayload {
  userId: string;
  role: Role;
}
