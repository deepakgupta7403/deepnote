/**
 * StatCard — KPI tile for the dashboard.
 */
export default function StatCard({ label, value, sub, icon, accent = false }) {
  return (
    <div className={`card p-5 relative overflow-hidden ${accent ? 'bg-ink-900 text-white border-ink-900 dark:bg-white dark:text-ink-900 dark:border-white' : ''}`}>
      {/* Decorative blur */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30
        ${accent ? 'bg-accent-400' : 'bg-accent-300/50'}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs uppercase tracking-[0.16em] ${
            accent ? 'text-white/60 dark:text-ink-900/60' : 'text-ink-500'
          }`}>
            {label}
          </span>
          <span className={`text-xl ${accent ? 'text-white/80 dark:text-ink-900/80' : 'text-ink-400'}`}>
            {icon}
          </span>
        </div>
        <div className="font-display text-4xl leading-none tracking-tight">{value}</div>
        {sub && (
          <p className={`text-xs mt-2 ${accent ? 'text-white/60 dark:text-ink-900/60' : 'text-ink-500'}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}
