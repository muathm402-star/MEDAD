export function Badge({ children, tone = 'default' }) {
  const map = { default: '', blue: 'badge-blue', teal: 'badge-teal', gold: 'badge-gold', navy: 'badge-navy', ok: 'badge-ok', warn: 'badge-warn', bad: 'badge-bad' }
  return <span className={`badge ${map[tone] || ''}`}>{children}</span>
}

export function Button({ children, variant = 'primary', size, block, className = '', ...props }) {
  const v = { primary: 'btn-primary', gold: 'btn-gold', ghost: 'btn-ghost', outline: 'btn-outline', teal: 'btn-teal' }[variant] || 'btn-primary'
  return (
    <button className={`btn ${v} ${size === 'sm' ? 'btn-sm' : ''} ${block ? 'btn-block' : ''} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Field({ label, children }) {
  return (
    <div className="field">
      {label ? <label className="label">{label}</label> : null}
      {children}
    </div>
  )
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {children ? <p className="muted">{children}</p> : null}
    </div>
  )
}

export function Loading() {
  return (
    <div className="loading-block">
      <div className="spinner" />
      <div>…</div>
    </div>
  )
}

export function Avatar({ user, size = '' }) {
  const cls = `avatar ${size}`.trim()
  if (user?.avatar) return <img className={cls} src={user.avatar} alt={user.name} />
  const ch = (user?.name || '?').trim().charAt(0)
  return <div className={cls}>{ch}</div>
}

export function ProgressBar({ value }) {
  return (
    <div className="progress" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function LevelBadge({ level, t }) {
  const tone = { beginner: 'teal', foundation: 'teal', intermediate: 'blue', advanced: 'navy', professional: 'gold' }[level] || 'default'
  return <Badge tone={tone}>{t(`common.${level}`) || level}</Badge>
}

export function Stars({ value }) {
  const full = Math.round(value)
  return (
    <span className="gold" title={String(value)}>
      {'★'.repeat(full)}
      {'☆'.repeat(Math.max(0, 5 - full))}
      <span className="muted small"> {Number(value).toFixed(1)}</span>
    </span>
  )
}

export function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="mobile-drawer" onClick={onClose} role="presentation">
      <div className="mobile-panel" style={{ inset: 'auto', top: '10vh', insetInline: '50%', transform: 'translateX(-50%)', width: 'min(560px, 92vw)', borderRadius: 16, maxHeight: '80vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="split mb">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="icon-btn" onClick={onClose} type="button">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
