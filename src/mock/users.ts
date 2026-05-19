export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company: string;
  role: "owner" | "admin" | "agent";
  phone?: string;
  createdAt: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "user-001",
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex@rentflow.io",
    password: "demo1234",
    company: "RentFlow Propiedades",
    role: "owner",
    phone: "+54 11 5555-0001",
    createdAt: "2025-01-15T00:00:00Z",
  },
  {
    id: "user-002",
    firstName: "Demo",
    lastName: "Usuario",
    email: "demo@demo.com",
    password: "demo1234",
    company: "Demo Inmobiliaria",
    role: "admin",
    phone: "+54 11 5555-0002",
    createdAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "user-003",
    firstName: "María",
    lastName: "González",
    email: "maria@propiedades.com",
    password: "demo1234",
    company: "González & Asociados",
    role: "agent",
    phone: "+54 11 5555-0003",
    createdAt: "2025-04-10T00:00:00Z",
  },
];
