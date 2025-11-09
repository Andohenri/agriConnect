import type { Role, Statut } from "@/types/enums";

declare global {
  interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    mot_de_passe: string;
    role: Role;
    avatar?: string;
    adresse?: string | null;
    localisation?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    statut?: Statut;
    createdAt?: string;
    updatedAt?: string;
  }

}

export {};
