import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const TextareaField = ({ name, label, placeholder, rows, register, error, disabled, validation, value }: FormInputProps) => {
  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='form-label'>
        {label}
        {validation?.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        className={cn('form-input', { 'opacity-50 cursor-not-allowed': disabled })}
        {...register(name, validation)}
      />
      {error && <p className='text-red-500 text-sm'>{error.message}</p>}
    </div>
  )
}

export default TextareaField