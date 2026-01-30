import React, { ButtonHTMLAttributes, InputHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

// ============================================
// BUTTON COMPONENT
// ============================================
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  glow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  glow = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-lg shadow-secondary-500/30 hover:shadow-secondary-500/50',
    ghost: 'bg-transparent hover:bg-white/10 text-white',
    outline: 'bg-transparent border-2 border-slate-600 hover:border-primary-500 hover:bg-primary-500/10 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white shadow-glass',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  return (
    <button
      ref={ref}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${glow ? 'animate-glow' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer effect on hover */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span className="relative">{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

// ============================================
// INPUT COMPONENT
// ============================================
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'glass';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  iconPosition = 'left',
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const variants = {
    default: 'bg-slate-900/80 border-slate-700 focus:border-primary-500 focus:ring-primary-500/30',
    filled: 'bg-slate-800 border-transparent focus:border-primary-500 focus:ring-primary-500/30',
    glass: 'bg-white/5 backdrop-blur-xl border-white/10 focus:border-primary-500/50 focus:ring-primary-500/20',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-xl border-2 px-4 py-3 text-white placeholder-slate-500
            transition-all duration-300 outline-none
            focus:ring-4
            ${variants[variant]}
            ${icon && iconPosition === 'left' ? 'pl-11' : ''}
            ${icon && iconPosition === 'right' ? 'pr-11' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors">
            {icon}
          </span>
        )}
        {/* Animated bottom border */}
        <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 group-focus-within:w-full group-focus-within:left-0 transition-all duration-300 rounded-full" />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 animate-slide-down">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// ============================================
// CARD COMPONENT
// ============================================
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'outline';
  hover?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hover = false,
  glow = false,
  className = '',
  onClick,
}) => {
  const variants = {
    default: 'bg-slate-800/60 border-slate-700/50',
    glass: 'bg-white/5 backdrop-blur-xl border-white/10',
    elevated: 'bg-slate-800 border-slate-700 shadow-elevated',
    gradient: 'bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-800/80 border-slate-700/50',
    outline: 'bg-transparent border-2 border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border p-5 transition-all duration-300
        ${variants[variant]}
        ${hover ? 'hover:border-primary-500/50 hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''}
        ${glow ? 'shadow-glow-primary' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// ============================================
// BADGE COMPONENT
// ============================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'glass';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const variants = {
    default: 'bg-slate-700 text-slate-300',
    primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
    secondary: 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    glass: 'bg-white/10 backdrop-blur-sm text-white border border-white/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full uppercase tracking-wide
        ${variants[variant]}
        ${sizes[size]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// ============================================
// SKELETON LOADER
// ============================================
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const variants = {
    text: 'h-4 rounded-lg',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl h-32',
  };

  return (
    <div
      className={`
        animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800
        bg-[length:200%_100%] animate-shimmer
        ${variants[variant]}
        ${className}
      `}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
    />
  );
};

// ============================================
// DIVIDER COMPONENT
// ============================================
interface DividerProps {
  text?: string;
  variant?: 'solid' | 'dashed' | 'gradient';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  text,
  variant = 'solid',
  className = '',
}) => {
  const variants = {
    solid: 'border-slate-700',
    dashed: 'border-dashed border-slate-700',
    gradient: 'border-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent',
  };

  if (text) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <span className={`flex-1 border-t ${variants[variant]}`} />
        <span className="text-xs text-slate-500 uppercase tracking-wide">{text}</span>
        <span className={`flex-1 border-t ${variants[variant]}`} />
      </div>
    );
  }

  return <div className={`border-t ${variants[variant]} ${className}`} />;
};

// ============================================
// AVATAR COMPONENT
// ============================================
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-500',
    busy: 'bg-red-500',
    away: 'bg-amber-500',
  };

  const statusSizes = {
    sm: 'w-2 h-2 -bottom-0 -right-0',
    md: 'w-3 h-3 -bottom-0.5 -right-0.5',
    lg: 'w-4 h-4 -bottom-0.5 -right-0.5',
    xl: 'w-5 h-5 bottom-0 right-0',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-slate-700`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center font-bold text-white ring-2 ring-slate-700`}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`absolute ${statusSizes[size]} ${statusColors[status]} rounded-full ring-2 ring-slate-900`}
        />
      )}
    </div>
  );
};

// ============================================
// SPINNER COMPONENT
// ============================================
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colors = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white',
  };

  return (
    <div
      className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
};

// ============================================
// PROGRESS BAR COMPONENT
// ============================================
interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'secondary' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variants = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    gradient: 'bg-gradient-to-r from-primary-500 to-secondary-500',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`${sizes[size]} bg-slate-800 rounded-full overflow-hidden`}>
        <div
          className={`${sizes[size]} ${variants[variant]} rounded-full transition-all duration-500 ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ============================================
// ANIMATED BACKGROUND BLOBS
// ============================================
export const AnimatedBlobs: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
    <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob" />
    <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary-500/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000" />
    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-4000" />
  </div>
);

// ============================================
// GLASS CONTAINER
// ============================================
interface GlassContainerProps {
  children: React.ReactNode;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  blur = 'xl',
  className = '',
}) => {
  const blurs = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  return (
    <div
      className={`
        bg-white/5 ${blurs[blur]} border border-white/10 rounded-2xl
        shadow-glass
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// ============================================
// TOOLTIP COMPONENT
// ============================================
interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
}) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={`
          absolute ${positions[position]} px-2 py-1
          bg-slate-800 text-white text-xs rounded-lg
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 whitespace-nowrap z-50
          border border-slate-700 shadow-lg
        `}
      >
        {content}
      </div>
    </div>
  );
};

export default {
  Button,
  Input,
  Card,
  Badge,
  Skeleton,
  Divider,
  Avatar,
  Spinner,
  Progress,
  AnimatedBlobs,
  GlassContainer,
  Tooltip,
};
