'use client';
import React, { useEffect, useState, } from 'react';
import { CommandDialog, CommandEmpty, CommandInput, CommandList, } from '@/components/ui/command';
import { Loader2, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useMediaQuery } from 'react-responsive';
import { cn } from '@/lib/utils';

export default function SearchCommand({ placeholder, className }: { placeholder?: string, className?: string }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  // const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? [] /* stocks */ : [] /* initialStocks */;

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

  const handleSearch = async () => {
    if (!isSearchMode) {
      // setStocks(initialStocks);
      return;
    }
    setLoading(true);
    try {
      // const results = await searchStocks(searchTerm.trim());
      // setStocks(results);
    } catch (error) {
      // setStocks([]);
    } finally {
      setLoading(false);
    }
  }

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm('');
    // setStocks(initialStocks);
  };

  // Handle watchlist changes status change
  // const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
  //   setStocks((prev) => {
  //     const source = prev?.length ? prev : initialStocks;
  //     return (source ?? []).map((stock) =>
  //       stock.symbol === symbol ? { ...stock, isInWatchlist: isAdded } : stock
  //     );
  //   });
  // };

  const isMac = typeof navigator !== 'undefined' &&
    navigator.userAgent.toUpperCase().includes('MAC');

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn("inline-flex items-center justify-between gap-2 text-sm text-muted-foreground", className)}
      >
        <span>{placeholder}</span>
        <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} className="lg:min-w-[400px] border-gray-200 fixed top-10 left-1/2 -translate-x-1/2 translate-y-10">
        <div className="border-b border-gray-200 relative">
          <CommandInput className='border-0 text-gray-400 placeholder:text-gray-500 focus:ring-0 text-base h-14 pr-10' placeholder="Rechercher..." value={searchTerm} onValueChange={setSearchTerm} />
          {loading && <Loader2 className='absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 animate-spin' />}
        </div>
        <CommandList className='max-h-[400px]'>
          {loading ? (
            <CommandEmpty className='py-6 bg-transparent text-center text-gray-500'>Loading Stocks...</CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className='px-5 py-2'>
              {isSearchMode ? 'Aucun résultat trouvé.' : 'Aucun produit disponible.'}
            </div>
          ) : (
            <ul>
              <div className="py-2 px-4 text-sm font-medium text-gray-400 bg-gray-700 border-b border-gray-700">
                {isSearchMode ? 'Résultats de recherche' : 'Produits populaires'}
                {` `}({displayStocks?.length || 0})
              </div>
              {displayStocks?.map((stock, i) => (
                <li key={i} className="rounded-none my-3 px-1 w-full data-[selected=true]:bg-gray-600">
                  {/* <Link
                    to={`/stocks/${stock.symbol}`}
                    onClick={handleSelectStock}
                    className="search-item-link"
                  >
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="search-item-name">
                        {stock.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stock.symbol} | {stock.exchange} | {stock.type}
                      </div>
                    </div>
                    <WatchlistButton
                      type='icon'
                      symbol={stock.symbol}
                      company={stock.name}
                      isInWatchlist={stock.isInWatchlist}
                      onWatchlistChange={handleWatchlistChange}
                    />
                  </Link> */}
                </li>
              ))}
            </ul>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}