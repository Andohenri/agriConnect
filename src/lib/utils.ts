import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProductType, Unite, ProductStatut } from "@/types/enums";

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
  return numPrice.toLocaleString('fr-FR', {
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
