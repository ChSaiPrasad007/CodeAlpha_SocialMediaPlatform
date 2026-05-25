const EmptyState = ({ title, message, icon: Icon }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
    {Icon ? <Icon className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" /> : null}
    <h3 className="text-base font-semibold text-ink">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{message}</p>
  </div>
);

export default EmptyState;
