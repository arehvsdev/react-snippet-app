import { useState } from 'react';
import type { FC, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { RADII } from '../../constants/styles';


// Shared Tailwind CSS classes for a consistent look and feel.
const baseWrapperClasses = 'mb-3';
const labelClasses = 'text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1 block';
const errorTextClasses = 'text-[10px] text-red-400 font-medium ml-1 mt-0.5';

// Shared styles for form elements.
const baseElementClasses = `w-full bg-[#1b1c1e] border px-3.5 h-10 text-sm font-medium text-white focus:outline-none focus:ring-2 placeholder:text-gray-500 transition-all ${RADII.element}`;
const errorElementClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500/10';
const normalElementClasses = 'border-white/10 focus:border-purple-500 focus:ring-purple-500/10';

// --- Input Component ---

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const Input: FC<InputProps> = ({ label, error, required, className, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  const finalClasses = `${baseElementClasses} ${error ? errorElementClasses : normalElementClasses} ${isPasswordType ? 'pr-10' : ''} ${className || ''}`;

  return (
    <div className={baseWrapperClasses}>
      {label && (
        <label htmlFor={props.id} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input {...props} type={inputType} className={finalClasses} />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className={errorTextClasses}>{error}</p>}
    </div>
  );
};

// --- Select Component ---

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export const Select: FC<SelectProps> = ({ label, error, required, options, className, ...props }) => {
  const finalClasses = `${baseElementClasses} ${error ? errorElementClasses : normalElementClasses} appearance-none cursor-pointer ${className || ''}`;

  return (
    <div className={baseWrapperClasses}>
      {label && (
        <label htmlFor={props.id} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select {...props} className={finalClasses}>
          {/* Use the placeholder prop for the disabled default option */}
          {props.placeholder && (
            <option value="" disabled>
              {props.placeholder}
            </option>
          )}
          {/* Map over the options array to create the dropdown list */}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Add a custom dropdown arrow icon for a modern look */}
        <ChevronDown
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {error && <p className={errorTextClasses}>{error}</p>}
    </div>
  );
};
