// Simulated users for the application
// In a real app, these would come from an API
export interface MockUser {
  id: string;
  name: string;
  initials: string;
  color: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export const MOCK_USERS: MockUser[] = [
  { id: 'user-1', name: 'Alice Chen', initials: 'AC', color: '#1B4332', email: 'alice@canopy.dev', role: 'admin' },
  { id: 'user-2', name: 'Bob Smith', initials: 'BS', color: '#2D6A4F', email: 'bob@canopy.dev', role: 'member' },
  { id: 'user-3', name: 'Carol Davis', initials: 'CD', color: '#52796F', email: 'carol@canopy.dev', role: 'member' },
  { id: 'user-4', name: 'Dan Wilson', initials: 'DW', color: '#D4A373', email: 'dan@canopy.dev', role: 'member' },
  { id: 'user-5', name: 'Eve Johnson', initials: 'EJ', color: '#BC6C25', email: 'eve@canopy.dev', role: 'viewer' },
];

export const MOCK_USERS_MAP: Record<string, MockUser> = Object.fromEntries(
  MOCK_USERS.map(u => [u.id, u])
);

// Current user (simulated)
export const CURRENT_USER = MOCK_USERS[0];

export function getUserById(id: string): MockUser | undefined {
  return MOCK_USERS_MAP[id];
}

export function getUserInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
