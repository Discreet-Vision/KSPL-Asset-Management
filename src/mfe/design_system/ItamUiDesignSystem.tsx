// ==================== SHARED DESIGN SYSTEM (@itam/ui) ====================
// Strict Red + Black + White enterprise design system components.
// Zero blue/green/yellow accents. All status indicators and controls use approved monochromatic/red palette.

import React from 'react';

// ----------------- BUTTON -----------------
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const base = 'font-mono font-bold uppercase transition-colors rounded cursor-pointer inline-flex items-center justify-center border focus:outline-none';
  
  const sizes = {
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm',
  };

  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-sm',
    secondary: 'bg-black hover:bg-zinc-900 text-white border-zinc-800',
    outline: 'bg-transparent text-white border-zinc-700 hover:border-white hover:bg-zinc-900',
    danger: 'bg-red-700 hover:bg-red-800 text-white border-red-600',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// ----------------- INPUT -----------------
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1 font-mono text-xs">
      {label && <label className="text-zinc-400 block uppercase text-[10px] font-bold">{label}</label>}
      <input
        className={`w-full bg-black text-white border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-500 transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-red-500 text-[10px] block font-bold">{error}</span>}
    </div>
  );
};

// ----------------- SELECT -----------------
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="space-y-1 font-mono text-xs">
      {label && <label className="text-zinc-400 block uppercase text-[10px] font-bold">{label}</label>}
      <select
        className={`w-full bg-black text-white border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-500 transition-colors ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// ----------------- BADGE (STRICT RED/BLACK/WHITE) -----------------
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'pending' | 'alert' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const variants = {
    active: 'bg-black text-white border border-white font-bold',
    pending: 'bg-zinc-900 text-zinc-300 border border-zinc-700',
    alert: 'bg-red-600 text-white font-bold border border-red-500',
    neutral: 'bg-zinc-950 text-zinc-400 border border-zinc-800',
  };

  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono rounded uppercase tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
};

// ----------------- CARD -----------------
export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, action, className = '' }) => {
  return (
    <div className={`bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
          <div>
            {title && <h3 className="text-xs font-bold text-white uppercase tracking-wide">{title}</h3>}
            {subtitle && <p className="text-[10px] text-zinc-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

// ----------------- TABLE -----------------
export interface TableProps {
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
}

export const Table: React.FC<TableProps> = ({ headers, rows }) => {
  return (
    <div className="overflow-x-auto border border-zinc-800 rounded-lg font-mono text-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-black border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
            {headers.map((h, idx) => (
              <th key={idx} className="p-3 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-950">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-zinc-900 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-3 text-zinc-200 text-[11px]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ----------------- MODAL -----------------
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 font-mono">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-lg p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white cursor-pointer text-sm font-bold">
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// ----------------- LOADER -----------------
export const Loader: React.FC<{ label?: string }> = ({ label = 'Loading Micro-Frontend Module...' }) => {
  return (
    <div className="p-12 text-center font-mono space-y-3 bg-zinc-950 border border-zinc-800 rounded-lg">
      <div className="inline-block w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-zinc-400 uppercase tracking-widest">{label}</p>
    </div>
  );
};

// ----------------- EMPTY STATE -----------------
export const EmptyState: React.FC<{ message: string; action?: React.ReactNode }> = ({ message, action }) => {
  return (
    <div className="p-12 text-center font-mono space-y-3 bg-zinc-950 border border-zinc-800 rounded-lg">
      <div className="text-red-600 text-2xl font-bold">!</div>
      <p className="text-xs text-zinc-400 max-w-md mx-auto">{message}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
