import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProductType, Unite, ProductStatut, CommandeStatut, StatutCommandeLigne } from "@/types/enums";
import { CheckCircle, Clock, DollarSign, ShoppingCart, TrendingUp, Truck, X, TrendingDown, Minus } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.GRAIN]: 'Grain',
  [ProductType.LEGUMINEUSE]: 'Légumineuse',
  [ProductType.TUBERCULE]: 'Tubercule',
  [ProductType.FRUIT]: 'Fruit',
  [ProductType.LEGUME]: 'Légume',
  [ProductType.EPICE]: 'Épice',
  [ProductType.AUTRE]: 'Autre'
};

export const UNITE_LABELS: Record<Unite, string> = {
  [Unite.KG]: 'kg',
  [Unite.TONNE]: 'tonne(s)',
  [Unite.SAC]: 'sac(s)',
  [Unite.LITRE]: 'litre(s)'
};

export const PRODUCT_STATUT_CONFIG: Record<ProductStatut, {
  label: string;
  variant: 'success' | 'warning' | 'destructive';
  color: string;
}> = {
  [ProductStatut.DISPONIBLE]: {
    label: 'Disponible',
    variant: 'success',
    color: 'bg-green-100 text-green-700'
  },
  [ProductStatut.RUPTURE]: {
    label: 'Rupture de stock',
    variant: 'destructive',
    color: 'bg-red-100 text-red-700'
  },
  [ProductStatut.ARCHIVE]: {
    label: 'Archivé',
    variant: 'warning',
    color: 'bg-gray-100 text-gray-700'
  }
};

// Icônes par type de produit (emoji ou lucide-react)
export const PRODUCT_TYPE_ICONS: Record<ProductType, string> = {
  [ProductType.GRAIN]: '🌾',
  [ProductType.LEGUMINEUSE]: '🫘',
  [ProductType.TUBERCULE]: '🥔',
  [ProductType.FRUIT]: '🍎',
  [ProductType.LEGUME]: '🥬',
  [ProductType.EPICE]: '🌶️',
  [ProductType.AUTRE]: '📦'
};

// Formater la date
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d?.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Formater le prix
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice?.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Formater la quantité
export function formatQuantity(quantity: number | string, unite?: Unite): string {
  const numQuantity = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  const uniteLabel = unite ? UNITE_LABELS[unite] : 'unité(s)';
  return `${numQuantity?.toLocaleString('fr-FR')} ${uniteLabel}`;
}

// Configuration des statuts
export const ORDER_STATUT_CONFIG: Record<CommandeStatut, {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  color: string;
  icon: any;
}> = {
  [CommandeStatut.EN_ATTENTE]: {
    label: "En attente",
    variant: "warning",
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-yellow-800",
    icon: Clock,
  },
  [CommandeStatut.ACCEPTEE]: {
    label: "Acceptée",
    variant: "success",
    color: "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800",
    icon: CheckCircle,
  },
  [CommandeStatut.OUVERTE]: {
    label: "Ouverte",
    variant: "default",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800",
    icon: ShoppingCart,
  },
  [CommandeStatut.PARTIELLEMENT_FOURNIE]: {
    label: "Partiellement fournie",
    variant: "warning",
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800",
    icon: TrendingUp,
  },
  [CommandeStatut.COMPLETE]: {
    label: "Complète",
    variant: "success",
    color: "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800",
    icon: CheckCircle,
  },
  [CommandeStatut.PAYEE]: {
    label: "Payée",
    variant: "success",
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800",
    icon: DollarSign,
  },
  [CommandeStatut.LIVREE]: {
    label: "Livrée",
    variant: "success",
    color: "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800",
    icon: Truck,
  },
  [CommandeStatut.ANNULEE]: {
    label: "Annulée",
    variant: "destructive",
    color: "bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800",
    icon: X,
  },
};

export const LINE_STATUT_CONFIG: Record<StatutCommandeLigne, {
  label: string;
  color: string;
}> = {
  [StatutCommandeLigne.EN_ATTENTE]: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-700",
  },
  [StatutCommandeLigne.ACCEPTEE]: {
    label: "Acceptée",
    color: "bg-green-100 text-green-700",
  },
  [StatutCommandeLigne.REJETEE]: {
    label: "Rejetée",
    color: "bg-red-100 text-red-700",
  },
};

export const getPriceIndicator = (difference: number) => {
  if (difference > 0) {
    return {
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      label: "Supérieur"
    };
  } else if (difference < 0) {
    return {
      icon: TrendingDown,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      label: "Inférieur"
    };
  } else {
    return {
      icon: Minus,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      label: "Identique"
    };
  }
};


export function convertToCommandeFormatted(data: CommandeProduit): Order {
  return {
    id: data.commande.id,
    produitRecherche: data.commande.produitRecherche,
    quantiteTotal: Number(data.commande.quantiteTotal),
    unite: data.produit.unite,
    prixUnitaire: Number(data.commande.prixUnitaire),
    statut: data.commande.statut,
    messageCollecteur: data.commande.messageCollecteur,

    // New fields → you can adjust as needed
    dateLivraisonPrevue: data.commande.dateLivraisonPrevue,
    dateLivraison: null,
    adresseLivraison: data.commande.adresseLivraison,
    updatedAt: data.commande.createdAt,
    createdAt: data.commande.createdAt,
    territoire: data.commande.territoire,
    latitude: null,
    longitude: null,
    rayon: null,

    // Collecteur data
    collecteurId: data.commande.collecteur?.id,
    collecteur: data.commande.collecteur,

    // Build lignes array
    lignes: [
      {
        id: data.id,
        quantiteAccordee: Number(data.quantiteAccordee),
        prixUnitaire: data.prixUnitaire,
        statutLigne: data.statutLigne as StatutCommandeLigne,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        commandeId: data.commandeId,
        produitId: data.produitId,
        paysanId: data.paysanId,
        produit: data.produit,
      }
    ]
  };
};

export function convertDataToCommandeFormattedList(data: CommandeProduit[]): Order[] {
  return data.map(item => convertToCommandeFormatted(item));
}


export function timeAgo(date: string | Date) {
  const now = new Date();
  const past = new Date(date);
  const diff = (past.getTime() - now.getTime()) / 1000; // en secondes

  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

  const ranges: Record<string, number> = {
    year: 3600 * 24 * 365,
    month: 3600 * 24 * 30,
    week: 3600 * 24 * 7,
    day: 3600 * 24,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, seconds] of Object.entries(ranges)) {
    const value = Math.floor(diff / seconds * -1);
    if (Math.abs(value) >= 1) {
      return rtf.format(-value, unit as Intl.RelativeTimeFormatUnit);
    }
  }

  return "à l’instant";
}
