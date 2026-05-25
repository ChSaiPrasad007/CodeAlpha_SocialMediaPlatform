const LoadingSpinner = ({ label = 'Loading' }) => (
  <div className="flex min-h-[240px] items-center justify-center">
    <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-soft">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-ocean" />
      {label}
    </div>
  </div>
);

export default LoadingSpinner;
