import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import React from "react";
import { Controller } from "react-hook-form";

interface LocationIQSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationField({
  control,
  localisationName = "localisation",
  latitudeName = "latitude",
  longitudeName = "longitude",
  label = "Localisation",
  required = false,
  errors,
}: LocationComboboxSeparateFieldsProps) {
  const [open, setOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<LocationIQSuggestion[]>([]);
  const [searchInput, setSearchInput] = React.useState("");

  const fetchSuggestions = async (input: string) => {
    try {
      const response = await axios.get<LocationIQSuggestion[]>(
        import.meta.env.VITE_LOCATION_URL,
        {
          params: {
            key: import.meta.env.VITE_LOCATION_API_KEY,
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

  const debouncedFetch = useDebounce(() => {
    if (searchInput.length > 2) {
      fetchSuggestions(searchInput);
    } else {
      setSuggestions([]);
    }
  }, 500);

  const handleSearchChange = (search: string) => {
    setSearchInput(search);
    debouncedFetch();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={localisationName} className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <Controller
        name={localisationName}
        control={control}
        rules={{
          required: required ? `${label} est requis` : false,
        }}
        render={({ field: localisationField }) => (
          <Controller
            name={latitudeName}
            control={control}
            render={({ field: latitudeField }) => (
              <Controller
                name={longitudeName}
                control={control}
                render={({ field: longitudeField }) => (
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-left font-normal h-auto min-h-11 py-3"
                      >
                        <span className="block truncate pr-2">
                          {localisationField.value || "Rechercher une adresse..."}
                        </span>
                        <ChevronsUpDown className="opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="sm:w-[350px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Saisir une adresse..."
                          className="h-9"
                          value={searchInput}
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
                                  onSelect={() => {
                                    // ✅ Met à jour les 3 champs séparément
                                    localisationField.onChange(suggestion.display_name);
                                    latitudeField.onChange(parseFloat(suggestion.lat));
                                    longitudeField.onChange(parseFloat(suggestion.lon));
                                    setSearchInput("");
                                    setOpen(false);
                                    setSuggestions([]);
                                  }}
                                  className="flex items-start"
                                >
                                  <span className="flex-1 wrap-break-words pr-2">
                                    {suggestion.display_name}
                                  </span>
                                  <Check
                                    className={cn(
                                      "shrink-0 ml-auto",
                                      localisationField.value === suggestion.display_name
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
                )}
              />
            )}
          />
        )}
      />

      {errors?.localisation && (
        <p className="text-red-500 text-sm">{errors.localisation.message}</p>
      )}
    </div>
  );
}