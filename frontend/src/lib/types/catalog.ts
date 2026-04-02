export type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type TechnicianRow = {
  id: string;
  name: string;
  specialty: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
