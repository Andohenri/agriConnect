// Objet constant pour le statut
export const Statut = {
  ACTIF: "actif",
  INACTIF: "inactif",
  SUSPENDU: "suspendu",
} as const;

export const Role = {
  PAYSAN: "paysan",
  COLLECTEUR: "collecteur",
  ADMIN: "admin",
} as const;

export const ProductType = {
  GRAIN: 'grain',
  LEGUMINEUSE: 'legumineuse',
  TUBERCULE: 'tubercule',
  FRUIT: 'fruit',
  LEGUME: 'legume',
  EPICE: 'epice',
  AUTRE: 'autre'
} as const;

export const Unite = {
  KG: 'kg',
  TONNE: 'tonne',
  SAC: 'sac',
  LITRE: 'litre'
} as const;

export const ProductStatut = {
  DISPONIBLE: 'disponible',
  RUPTURE: 'rupture',
  ARCHIVE: 'archive'
} as const;

export const OrderStatut = {
  EN_ATTENTE: "en_attente",
  OUVERTE: "ouverte",
  PARTIELLEMENT_FOURNIE: "partiellement_fournie",
  COMPLETE: "complete",
  ACCEPTEE: "acceptee",
  LIVREE: "livree",
  ANNULEE: "annulee",
} as const;