import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Controller } from 'react-hook-form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import countryList from 'react-select-country-list';
import * as flags from 'country-flag-icons/react/3x2';

const CountrySelectField = ({
  name,
  label,
  control,
  error,
  required = false
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);

  const options = useMemo(() => countryList().getData(), []);

  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='form-label'>{label}</Label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `Please select ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => {
          const selectedCountry = options.find((country) => country.value === field.value);

          const getFlagComponent = (countryCode: string) => {
            const FlagComponent = flags[countryCode as keyof typeof flags];
            return FlagComponent ? (
              <FlagComponent className="w-6 h-5 object-cover rounded-sm" />
            ) : null;
          };

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="country-select-trigger"
                >
                  {selectedCountry ? (
                    <span className="flex items-center gap-2">
                      {getFlagComponent(selectedCountry.value)}
                      {selectedCountry.label}
                    </span>
                  ) : (
                    'Select a country'
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600 scrollbar-hide-default" align='start'>
                <Command className="bg-gray-800">
                  <CommandInput placeholder="Search country..." className="country-select-input h-9" />
                  <CommandList>
                    <CommandEmpty className="country-select-empty">No country found.</CommandEmpty>
                    <CommandGroup className=''>
                      {options.map((country) => (
                        <CommandItem
                          key={country.value}
                          value={country.label}
                          onSelect={() => {
                            field.onChange(country.value === field.value ? '' : country.value);
                            setOpen(false);
                          }}
                          className="country-select-item"
                        >
                          <Check className={`mr-2 h-4 w-4 text-yellow-500 ${field.value === country.value ? 'opacity-100' : 'opacity-0'}`} />
                          {getFlagComponent(country.value)}
                          <span className="ml-2">{country.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      {error && <p className='text-red-500 text-sm'>{error.message}</p>}
      <p className='text-xs text-gray-500'>
        Helps us show market data and news relevant to you.
      </p>
    </div>
  );
};

export default CountrySelectField;