import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    helperText?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, helperText, error, icon, className = '', ...props }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                {label}
            </label>
            <div className="relative">
                <input
                    className={`
            block w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-xl transition-colors duration-200
            focus:outline-none focus:ring-0
            disabled:bg-gray-50 disabled:text-gray-500
            ${error
                            ? 'border-rose-300 focus:border-rose-500 placeholder-rose-300'
                            : 'border-gray-200 focus:border-blue-500 hover:border-blue-300'
                        }
            ${icon ? 'pl-11' : ''}
            ${className}
          `}
                    {...props}
                />
                {icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1.5 ml-1 text-sm text-rose-600 font-medium animate-pulse">
                    {error}
                </p>
            )}
            {!error && helperText && (
                <p className="mt-1.5 ml-1 text-sm text-gray-500">
                    {helperText}
                </p>
            )}
        </div>
    );
};
