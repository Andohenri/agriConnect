import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Controller } from "react-hook-form"


const SelectField = ({ name, label, placeholder, options, control, error, required = false }: SelectFieldProps) => {
  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='form-label'>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        defaultValue={""}
        rules={{
          required: required ? `Veuillez sélectionner ${label.toLocaleLowerCase()}` : false,
        }}
        render={({ field }) => (
          <Select value={field.value ?? ""} onValueChange={field.onChange}>
            <SelectTrigger className="select-trigger">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className='bg-white border-gray-200 text-gray-700'>
              {options.map((option) => (
                <SelectItem value={option.value} key={option.value} className='focus:bg-gray-200 focus:text-gray-700'>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className='text-red-500 text-sm'>{error.message}</p>}
    </div>
  )
}

export default SelectField