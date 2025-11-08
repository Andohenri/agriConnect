import * as React from "react";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";

// 🧩 Type retourné par LocationIQ
interface LocationIQSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

// 🧩 Type des données renvoyées à ton parent
interface Location {
  adresse: string;
  lat: string;
  lon: string;
}

// 🧩 Type des props du composant
interface LocationComboboxProps {
  onSelectLocation?: (location: Location) => void;
}

export function LocationCombobox({ onSelectLocation }: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<LocationIQSuggestion[]>(
    []
  );
  const [searchInput, setSearchInput] = React.useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [coordinates, setCoordinates] = React.useState<{
    lat: string | null;
    lon: string | null;
  }>({
    lat: null,
    lon: null,
  });

  // 🔍 Fonction de recherche
  const fetchSuggestions = async (input: string) => {
    try {
      const response = await axios.get<LocationIQSuggestion[]>(
        "https://api.locationiq.com/v1/autocomplete.php",
        {
          params: {
            key: "pk.9b6ea7aeaf1bcc4591142deadf064396",
            q: input,
            limit: 5,
          },
        }
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions :", error);
    }
  };

  // ⏱️ Debounce de la recherche
  const debouncedFetch = useDebounce(() => {
    if (searchInput.length > 2) {
      fetchSuggestions(searchInput);
    } else {
      setSuggestions([]);
    }
  }, 500);

  // ✅ Handler pour les changements de recherche
  const handleSearchChange = (search: string) => {
    setValue(search);
    setSearchInput(search);
    debouncedFetch();
  };

  const handleSelect = (suggestion: LocationIQSuggestion) => {
    setValue(suggestion.display_name);
    setCoordinates({ lat: suggestion.lat, lon: suggestion.lon });
    setOpen(false);
    setSuggestions([]);

    if (onSelectLocation) {
      onSelectLocation({
        adresse: suggestion.display_name,
        lat: suggestion.lat,
        lon: suggestion.lon,
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal h-auto min-h-[2.75rem] py-3"
        >
          <span className="block truncate pr-2">
            {value || "Rechercher une adresse..."}
          </span>
          <ChevronsUpDown className="opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Saisir une adresse..."
            className="h-9"
            value={value}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {suggestions.length === 0 ? (
              <CommandEmpty>Aucune adresse trouvée.</CommandEmpty>
            ) : (
              <CommandGroup>
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    value={suggestion.display_name}
                    onSelect={() => handleSelect(suggestion)}
                    className="flex items-start"
                  >
                    <span className="flex-1 break-words pr-2">
                      {suggestion.display_name}
                    </span>
                    <Check
                      className={cn(
                        "shrink-0 ml-auto",
                        value === suggestion.display_name
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
