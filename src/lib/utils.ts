import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProductType, Unite, ProductStatut, CommandeStatut, StatutCommandeLigne } from "@/types/enums";
import { CheckCircle, Clock, DollarSign, ShoppingCart, TrendingUp, Truck, X } from "lucide-react";

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
  return d.toLocaleDateString('fr-FR', {
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
  return `${numQuantity.toLocaleString('fr-FR')} ${uniteLabel}`;
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
  [CommandeStatut.PAYE]: {
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