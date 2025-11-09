import type { Role, Statut } from "@/types/enums";

declare global {
  enum Statut {
    ACTIF = "actif",
    INACTIF = "inactif",
    SUSPENDU = "suspendu",
  }

  enum Role {
    PAYSAN = "paysan",
    COLLECTEUR = "collecteur",
    ADMIN = "admin",
  }

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

  // Types pour les requêtes
  interface SignUpRequest {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    mot_de_passe: string;
    role: Role;
  }

  interface SignInRequest {
    email: string;
    password: string;
  }

  interface UpdateUserRequest {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    localisation?: string;
    latitude?: number;
    longitude?: number;
    avatar?: string;
  }

  // Réponses d'authentification
  interface AuthResponse {
    access_token: string;
    user: any;
  }
}

export {};
