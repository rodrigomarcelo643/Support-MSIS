import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  options?: SelectOption[];
  variant?: 'default' | 'filled' | 'outline';
  selectSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      options,
      variant = 'default',
      selectSize = 'md',
      fullWidth = true,
      disabled,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const sizeStyles = {
      sm: 'h-9 text-xs py-1.5 pl-3 pr-8 rounded-xl',
      md: 'h-11 text-xs py-2 pl-3.5 pr-10 rounded-xl',
      lg: 'h-12 text-sm py-2.5 pl-4 pr-12 rounded-xl',
    };

    const variantStyles = {
      default:
        'border border-slate-200 bg-white text-slate-800 shadow-xs focus:border-red-500 focus:ring-2 focus:ring-red-500/10',
      filled:
        'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200/60 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10',
      outline:
        'border-2 border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10',
    };

    const leftPadding = leftIcon
      ? selectSize === 'sm'
        ? 'pl-8'
        : selectSize === 'lg'
        ? 'pl-11'
        : 'pl-10'
      : '';

    return (
      <div className={cn('flex flex-col', fullWidth ? 'w-full' : 'w-auto', 'space-y-1.5')}>
        {label && (
          <label
            htmlFor={generatedId}
            className="text-xs font-semibold text-slate-700 select-none flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-red-500 text-xs ml-1">*</span>}
          </label>
        )}

        <div className="relative inline-flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={generatedId}
            disabled={disabled}
            className={cn(
              'w-full appearance-none transition-all duration-150 cursor-pointer outline-none bg-white text-slate-800',
              sizeStyles[selectSize],
              variantStyles[variant],
              leftPadding,
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10 text-red-900',
              disabled && 'opacity-60 cursor-not-allowed bg-slate-100',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="text-slate-800 bg-white py-1">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3.5 pointer-events-none text-slate-400">
            <ChevronDown className={cn(selectSize === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
          </div>
        </div>

        {error ? (
          <p className="flex items-center text-xs text-red-500 mt-1 gap-1">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
