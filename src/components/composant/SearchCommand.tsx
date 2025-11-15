import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  Command
} from '@/components/ui/command';
import { Loader2, Package, User, Search, TrendingUp, Wheat, Apple, Beef, Droplet } from 'lucide-react';
import { Button } from '../ui/button';
// import { Link } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
// import UserAvatar from './Avatar';

// Types pour les matières premières
type MaterialType = 'cereales' | 'legumes' | 'fruits' | 'viandes' | 'produits_laitiers' | 'autres';

interface Product {
  id: string;
  name: string;
  type: MaterialType;
  price: number;
  unit: string;
  stock?: number;
  image?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface SearchResults {
  products: Product[];
  users: User[];
}

// Icônes par type de matière première
const getTypeIcon = (type: MaterialType) => {
  switch (type) {
    case 'cereales':
      return <Wheat className="h-5 w-5 text-amber-600" />;
    case 'legumes':
      return <Apple className="h-5 w-5 text-green-600" />;
    case 'fruits':
      return <Apple className="h-5 w-5 text-orange-600" />;
    case 'viandes':
      return <Beef className="h-5 w-5 text-red-600" />;
    case 'produits_laitiers':
      return <Droplet className="h-5 w-5 text-blue-600" />;
    default:
      return <Package className="h-5 w-5 text-gray-600" />;
  }
};

// Labels français pour les types
const getTypeLabel = (type: MaterialType) => {
  const labels = {
    cereales: 'Céréales',
    legumes: 'Légumes',
    fruits: 'Fruits',
    viandes: 'Viandes',
    produits_laitiers: 'Produits laitiers',
    autres: 'Autres',
  };
  return labels[type];
};

export default function SearchCommand({
  placeholder = "Rechercher des matières premières...",
  className
}: {
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ products: [], users: [] });

  const isSearchMode = !!searchTerm.trim();

  // Raccourci clavier Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fonction de recherche
  const handleSearch = async () => {
    if (!isSearchMode) {
      setResults({ products: [], users: [] });
      return;
    }

    setLoading(true);
    try {
      const data = await searchProductsAndUsers(searchTerm.trim());
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ products: [], users: [] });
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleClose = () => {
    setOpen(false);
    setSearchTerm('');
    setResults({ products: [], users: [] });
  };

  const isMac = typeof navigator !== 'undefined' &&
    navigator.userAgent.toUpperCase().includes('MAC');

  const handleItemClick = (type: 'product' | 'user', id: string) => {
    console.log(`Navigating to ${type}:`, id);
    handleClose();
  };

  const totalResults = results.products.length + results.users.length;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center justify-between gap-2 text-sm text-muted-foreground hover:bg-accent transition-colors",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>{placeholder}</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
        </kbd>
      </Button>


      <CommandDialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) {
            handleClose();
          }
        }}
        className="lg:min-w-[550px] border-gray-200 fixed top-10 left-1/2 -translate-x-1/2 translate-y-10 overflow-hidden"
      >
        <div className="border-b border-gray-200 relative bg-white">
          <CommandInput
            className='border-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-base h-14 pr-10'
            placeholder="Rechercher des matières premières ou utilisateurs..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          {loading && (
            <Loader2 className='absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 animate-spin' />
          )}
        </div>
        <Command>
          <CommandList className='max-h-[500px] bg-white'>
            {loading ? (
              <CommandEmpty className='py-12 flex flex-col items-center justify-center gap-3'>
                <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
                <p className='text-sm text-muted-foreground'>Recherche en cours...</p>
              </CommandEmpty>
            ) : !isSearchMode ? (
              <CommandEmpty>
                <div className="py-8 flex flex-col items-center gap-2">
                  <Search className='h-10 w-10 text-muted-foreground opacity-50' />
                  <p className='text-sm text-muted-foreground'>Commencez à taper pour rechercher</p>
                </div>
              </CommandEmpty>
            ) : totalResults === 0 ? (
              <CommandEmpty>
                <div className="py-8 flex flex-col items-center gap-2">
                  <Search className='h-10 w-10 text-muted-foreground opacity-50' />
                  <p className='text-sm font-medium'>Aucun résultat trouvé</p>
                  <p className='text-xs text-muted-foreground'>Essayez avec d'autres mots-clés</p>
                </div>
              </CommandEmpty>
            ) : (
              <>
                {/* Section Matières Premières */}
                {results.products.length > 0 && (
                  <CommandGroup heading={`Matières Premières (${results.products.length})`}>
                    {results.products.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleItemClick('product', product.id)}
                        className="cursor-pointer"
                        onClick={() => console.log('')}
                      >
                        <div
                          onClick={() => console.log('Navigate to product:', product.id)}
                          className="flex items-center gap-3 w-full"
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                              {getTypeIcon(product.type)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500">{getTypeLabel(product.type)}</span>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs font-semibold text-green-600">
                                {product.price.toFixed(2)} € / {product.unit}
                              </span>
                              {product.stock && (
                                <>
                                  <span className="text-xs text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">
                                    Stock: {product.stock}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Séparateur entre les sections */}
                {results.products.length > 0 && results.users.length > 0 && (
                  <CommandSeparator />
                )}

                {/* Section Utilisateurs */}
                {results.users.length > 0 && (
                  <CommandGroup heading={`Utilisateurs (${results.users.length})`}>
                    {results.users.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => handleItemClick('user', user.id)}
                        className="cursor-pointer"
                      >
                        <div
                          onClick={() => console.log('Navigate to user:', user.id)}
                          className="flex items-center gap-3 w-full"
                        >
                          <div className="h-10 w-10 rounded-full bg-linear-to-br from-purple-100 to-purple-200 flex items-center justify-center border border-gray-200">
                            <span className="text-sm font-semibold text-purple-600">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500 truncate">{user.email}</span>
                              {user.role && (
                                <>
                                  <span className="text-xs text-gray-300">•</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                                    {user.role}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
          {/* Footer avec stats */}
          {isSearchMode && totalResults > 0 && (
            <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>{totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200">↑↓</kbd>
                <span>naviguer</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 ml-2">↵</kbd>
                <span>sélectionner</span>
              </span>
            </div>
          )}
        </Command>
      </CommandDialog>
    </>
  );
}

/**
 * Service pour rechercher des matières premières et utilisateurs
 */
async function searchProductsAndUsers(searchTerm: string): Promise<SearchResults> {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 400));

  // Données mockées - Matières premières
  const mockProducts: Product[] = [
    { id: '1', name: 'Blé tendre', type: 'cereales', price: 250, unit: 'tonne', stock: 1500 },
    { id: '2', name: 'Riz basmati', type: 'cereales', price: 1200, unit: 'tonne', stock: 800 },
    { id: '3', name: 'Maïs grain', type: 'cereales', price: 220, unit: 'tonne', stock: 2000 },
    { id: '4', name: 'Tomates', type: 'legumes', price: 2.5, unit: 'kg', stock: 5000 },
    { id: '5', name: 'Carottes bio', type: 'legumes', price: 1.8, unit: 'kg', stock: 3000 },
    { id: '6', name: 'Pommes de terre', type: 'legumes', price: 0.9, unit: 'kg', stock: 8000 },
    { id: '7', name: 'Pommes Golden', type: 'fruits', price: 3.2, unit: 'kg', stock: 4000 },
    { id: '8', name: 'Bananes', type: 'fruits', price: 2.1, unit: 'kg', stock: 2500 },
    { id: '9', name: 'Oranges', type: 'fruits', price: 2.8, unit: 'kg', stock: 3500 },
    { id: '10', name: 'Bœuf charolais', type: 'viandes', price: 15.5, unit: 'kg', stock: 600 },
    { id: '11', name: 'Poulet fermier', type: 'viandes', price: 8.9, unit: 'kg', stock: 1200 },
    { id: '12', name: 'Porc bio', type: 'viandes', price: 12.3, unit: 'kg', stock: 800 },
    { id: '13', name: 'Lait entier', type: 'produits_laitiers', price: 0.95, unit: 'L', stock: 10000 },
    { id: '14', name: 'Fromage comté', type: 'produits_laitiers', price: 18.5, unit: 'kg', stock: 400 },
    { id: '15', name: 'Beurre doux', type: 'produits_laitiers', price: 8.2, unit: 'kg', stock: 1500 },
  ];

  const mockUsers: User[] = [
    { id: '1', name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'Admin' },
    { id: '2', name: 'Marie Martin', email: 'marie.martin@example.com', role: 'Acheteur' },
    { id: '3', name: 'Pierre Durand', email: 'pierre.durand@example.com', role: 'Fournisseur' },
    { id: '4', name: 'Sophie Bernard', email: 'sophie.bernard@example.com', role: 'Gestionnaire' },
    { id: '5', name: 'Luc Moreau', email: 'luc.moreau@example.com', role: 'Vendeur' },
  ];

  const term = searchTerm.toLowerCase();

  const filteredProducts = mockProducts.filter(
    product =>
      product.name.toLowerCase().includes(term) ||
      getTypeLabel(product.type).toLowerCase().includes(term)
  );

  const filteredUsers = mockUsers.filter(
    user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
  );

  return { products: filteredProducts, users: filteredUsers };
}