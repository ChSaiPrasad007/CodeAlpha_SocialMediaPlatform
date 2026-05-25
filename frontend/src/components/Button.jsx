const Button = ({
  as: Component = 'button',
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-ink text-white hover:bg-slate-800',
    ocean: 'bg-ocean text-white hover:bg-blue-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    outline: 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300',
    danger: 'bg-coral text-white hover:bg-red-600'
  };

  const sizes = {
    sm: 'min-h-9 px-3 text-sm',
    md: 'min-h-11 px-4 text-sm',
    lg: 'min-h-12 px-5 text-base'
  };

  const componentProps =
    Component === 'button'
      ? { type, disabled }
      : {
          'aria-disabled': disabled || undefined
        };

  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...componentProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
