import type { Paginated } from "@/lib/types/catalog";

export type ReservationListItem = {
  id: string;
  clientId: string;
  technicianId: string;
  startAt: string;
  endAt: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string };
  technician: { id: string; name: string };
};

export type ReservationsListData = Paginated<ReservationListItem>;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "LECTOR";
};
