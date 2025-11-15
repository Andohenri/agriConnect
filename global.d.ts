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
    id?: string;
    nom: string;
    prenom?: string;
    email: string;
    telephone?: string;
    // mot_de_passe: string;
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
    confirmation_mot_de_passe: string;
    role: Role;
    adresse?: string;
    localisation?: string;
    latitude?: number;
    longitude?: number;
    avatar?: string;
  }

  interface SignInRequest {
    email: string;
    mot_de_passe: string;
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

  type FormInputProps = {
    name: string;
    label: string;
    placeholder: string;
    type?: string;
    rows?: number;
    register: UseFormRegister;
    error?: FieldError;
    validation?: RegisterOptions;
    disabled?: boolean;
    value?: string;
  };

  type SelectFieldProps = {
    name: string;
    label: string;
    placeholder: string;
    options: readonly Option[];
    control: Control;
    error?: FieldError;
    required?: boolean;
  };

  type LocationComboboxSeparateFieldsProps = {
    control: Control<any>;
    localisationName?: string;
    latitudeName?: string;
    longitudeName?: string;
    label?: string;
    required?: boolean;
    errors?: {
      localisation?: FieldError;
      latitude?: FieldError;
      longitude?: FieldError;
    };
  };

  enum ProductType {
    GRAIN = "grain",
    LEGUMINEUSE = "legumineuse",
    TUBERCULE = "tubercule",
    FRUIT = "fruit",
    LEGUME = "legume",
    EPICE = "epice",
    AUTRE = "autre",
  }

  enum Unite {
    KG = "kg",
    TONNE = "tonne",
    SAC = "sac",
    LITRE = "litre",
  }

  enum ProductStatut {
    DISPONIBLE = "disponible",
    RUPTURE = "rupture",
    ARCHIVE = "archive",
  }

  type LocalisationInfo = {
    adresse?: string;
    latitude?: number;
    longitude?: number;
  };

  type Product = {
    id?: string;
    nom: string;
    type: ProductType;
    sousType?: string | null;
    description?: string | null;
    quantiteDisponible: number | string;
    unite?: Unite;
    prixUnitaire: number;
    dateRecolte: Date | string;
    datePeremption?: Date | string | null;
    imageUrl?: string;
    statut?: ProductStatut;
    conditionsStockage?: string | null;
    localisation?: LocalisationInfo;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    paysan?: {
      id?: string;
      nom?: string;
      prenom?: string;
      telephone?: string;
      email?: string;
      role?: Role;
    };
  };

  type ProductFormData = {
    nom: string;
    type: ProductType;
    sousType?: string;
    description?: string;
    quantiteDisponible: number | string;
    unite?: Unite;
    prixUnitaire: number | string;
    dateRecolte: string;
    datePeremption?: string;
    image?: FileList;
    conditionsStockage?: string;
    localisation?: string;
    latitude?: number;
    longitude?: number;
  };

  type ProductResponse = {
    data: Product[];
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };

  type Zone = {
    id?: string;
    nom: string;
    description?: string;
    // Polygone représentant la zone : tableau de points (latitude, longitude)
    coordinates: { lat: number; lng: number }[];
    // Point central ou adresse associée
    centre?: {
      latitude: number;
      longitude: number;
      adresse?: string;
    };
    // Optionnel : qui a créé cette zone (utile pour filtrer par collecteur/admin)
    createdBy?: {
      id: string;
      nom: string;
      prenom: string;
      role: Role;
    };
    createdAt?: string;
    updatedAt?: string;
  };

  type Order = {
    id?: string;
    produitRecherche?: string | null;
    quantiteTotal?: number | string | null;
    unite?: Unite;
    prixUnitaire?: number | string | null;
    statut?: CommandeStatut;
    messageCollecteur?: string | null;
    adresseLivraison?: string | null;
    dateLivraisonPrevue?: Date | string | null;
    dateLivraison?: Date | string | null;
    territoire?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    rayon?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    collecteurId: string;
    collecteur?: {
      id?: string;
      nom?: string;
      prenom?: string;
      telephone?: string;
      email?: string;
      role?: Role;
    };
    lignes?: OrderLine[];
  };

  type OrderLine = {
    id?: string;
    produitId: string;
    quantiteFournie: number | string;
    prixUnitaire: number | string;
    sousTotal?: number | string;
    statutLigne?: StatutCommandeLigne;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    produit?: Product;
  };

  enum CommandeStatut {
    OUVERTE = "ouverte",
    PARTIELLEMENT_FOURNIE = "partiellement_fournie",

    EN_ATTENTE = "en_attente",
    COMPLETE = "complete",
    ACCEPTEE = "acceptee",
    PAYE = "paye",
    LIVREE = "livree",
    ANNULEE = "annulee",
  }

  enum StatutCommandeLigne {
    EN_ATTENTE = "en_attente",
    ACCEPTEE = "acceptee",
    REJETEE = "rejetee",
  }

  export type OrderFormData = {
    produitRecherche: string;
    quantiteTotal: number | string;
    unite: Unite;
    prixUnitaire: number | string;
    statut?: OrderStatut;
    messageCollecteur?: string;

    adresseLivraison?: string;
    dateLivraisonPrevue?: string;
    dateLivraison?: string;

    territoire?: string;
    latitude?: number;
    longitude?: number;
    rayon?: number;

    collecteurId: string;
  };

  export interface OrderPublishReq {
    produitRecherche: string;
    quantiteTotal: number | string;
    unite: Unite;
    prixUnitaire: number | string;
    messageCollecteur?: string;

    adresseLivraison?: string;
    dateLivraisonPrevue?: string;

    territoire?: string;
    latitude?: number;
    longitude?: number;
    rayon?: number;

    collecteurId: string;
  }

  type OrderResponse = {
    data: Order[];
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };

  type ChatMessages = Record<number, Message[]>;

  // === Types correspondant au schéma Prisma (backend) ===

  type MessageType = "texte" | "image" | "video" | "document";

  interface PrismaMessage {
    id: string;
    expediteurId: string;
    destinataireId: string;
    contenu?: string | null;
    typeContenu: MessageType;
    fichierUrl?: string | null;
    lu: boolean;
    dateEnvoi: string; // ISO string
    dateLecture?: string | null;
    updatedAt?: string;
    // relations (optional on client)
    expediteur?: User | null;
    destinataire?: User | null;
    conversationId?: string | null;
  }

  interface Conversation {
    id: string;
    participant1Id: string;
    participant2Id: string;
    dernierMessageId?: string | null;
    messagesNonLusP1: number;
    messagesNonLusP2: number;
    dateDerniereActivite: string; // ISO
    archiveP1: boolean;
    archiveP2: boolean;
    createdAt: string;
    updatedAt: string;
    participant1?: User | null;
    participant2?: User | null;
    dernierMessage?: PrismaMessage | null;
    messages?: PrismaMessage[];
  }
}

export {};
