import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Avatar, Button } from './UI'

function NavLinks({ onClick }) {
  const { t, user } = useApp()
  const items = [
    ['/', t('nav.home')],
    ['/courses', t('nav.courses')],
    ['/paths', t('nav.paths')],
    ['/instructors', t('nav.instructors')],
    ['/articles', t('nav.articles')],
    ['/verify', t('nav.verify')],
  ]
  return (
    <>
      {items.map(([to, label]) => (
        <NavLink key={to} to={to} end={to === '/'} onClick={onClick} className={({ isActive }) => (isActive ? 'active' : '')}>
          {label}
        </NavLink>
      ))}
      {user?.role === 'student' ? (
        <NavLink to="/dashboard" onClick={onClick} className={({ isActive }) => (isActive ? 'active' : '')}>{t('nav.dashboard')}</NavLink>
      ) : null}
      {user?.role === 'instructor' ? (
        <NavLink to="/instructor" onClick={onClick} className={({ isActive }) => (isActive ? 'active' : '')}>{t('nav.instructor')}</NavLink>
      ) : null}
      {user?.role === 'admin' ? (
        <NavLink to="/admin" onClick={onClick} className={({ isActive }) => (isActive ? 'active' : '')}>{t('nav.admin')}</NavLink>
      ) : null}
    </>
  )
}

export default function Layout() {
  const { t, state, setLang, user, logout, toasts } = useApp()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const location = useLocation()
  const hideFooter = location.pathname.startsWith('/learn/')

  return (
    <div className="shell">
      <div className="demo-bar">{t('demo.bar')}</div>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <img className="brand-mark" src="/brand/logo-mark.png" alt="" />
            <span className="brand-text">
              <span className="brand-ar">مِداد</span>
              <span className="brand-en">MEDAD</span>
            </span>
          </Link>
          <nav className="nav">
            <NavLinks />
          </nav>
          <div className="header-actions">
            <button className="icon-btn" type="button" title={t('common.language')} onClick={() => setLang(state.lang === 'ar' ? 'en' : 'ar')}>
              {state.lang === 'ar' ? 'EN' : 'ع'}
            </button>
            {user ? (
              <button className="user-chip" type="button" onClick={() => nav('/profile')}>
                <Avatar user={user} size="sm" />
                <span className="small">{state.lang === 'en' ? user.nameEn || user.name : user.name}</span>
              </button>
            ) : (
              <>
                <Link to="/login"><Button variant="outline" size="sm">{t('nav.login')}</Button></Link>
                <Link to="/register"><Button size="sm">{t('nav.register')}</Button></Link>
              </>
            )}
            {user ? (
              <Button variant="outline" size="sm" onClick={() => { logout(); nav('/'); }}>{t('nav.logout')}</Button>
            ) : null}
            <button className="icon-btn burger" type="button" onClick={() => setOpen(true)} aria-label="menu">☰</button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="mobile-drawer" onClick={() => setOpen(false)}>
          <div className="mobile-panel" onClick={(e) => e.stopPropagation()}>
            <div className="split mb">
              <strong>مِداد</strong>
              <button className="icon-btn" type="button" onClick={() => setOpen(false)}>×</button>
            </div>
            <nav className="dash-nav">
              <NavLinks onClick={() => setOpen(false)} />
              <NavLink to="/exams" onClick={() => setOpen(false)}>{t('nav.exams')}</NavLink>
              <NavLink to="/certificates" onClick={() => setOpen(false)}>{t('nav.certificates')}</NavLink>
              <NavLink to="/about" onClick={() => setOpen(false)}>{t('nav.about')}</NavLink>
              <NavLink to="/contact" onClick={() => setOpen(false)}>{t('nav.contact')}</NavLink>
              {user?.role === 'admin' ? <NavLink to="/instructor" onClick={() => setOpen(false)}>{t('nav.instructor')}</NavLink> : null}
            </nav>
          </div>
        </div>
      ) : null}

      <main className="main">
        <Outlet />
      </main>

      {hideFooter ? null : (
        <footer className="footer">
          <div className="container footer-grid">
            <div>
              <div className="brand" style={{ marginBottom: 12 }}>
                <img className="brand-mark" src="/brand/logo-mark.png" alt="" />
                <span className="brand-text">
                  <span className="brand-ar" style={{ color: '#f7f4ef' }}>مِداد</span>
                  <span className="brand-en">MEDAD</span>
                </span>
              </div>
              <p>{t('tagline')}</p>
              <p className="note">{state.lang === 'en' ? state.homepage.accreditationNoteEn : state.homepage.accreditationNote}</p>
            </div>
            <div>
              <h4>{t('nav.courses')}</h4>
              <div><Link to="/courses">{t('nav.courses')}</Link></div>
              <div><Link to="/paths">{t('nav.paths')}</Link></div>
              <div><Link to="/exams">{t('nav.exams')}</Link></div>
              <div><Link to="/articles">{t('nav.articles')}</Link></div>
            </div>
            <div>
              <h4>{t('brand')}</h4>
              <div><Link to="/about">{t('nav.about')}</Link></div>
              <div><Link to="/instructors">{t('nav.instructors')}</Link></div>
              <div><Link to="/verify">{t('nav.verify')}</Link></div>
              <div><Link to="/contact">{t('nav.contact')}</Link></div>
            </div>
            <div>
              <h4>{t('nav.contact')}</h4>
              <div>{state.settings.contactEmail}</div>
              <div>{state.settings.contactPhone}</div>
              <div className="small">{state.lang === 'en' ? state.settings.addressEn : state.settings.address}</div>
            </div>
          </div>
          <div className="container footer-bottom">
            <span>© {new Date().getFullYear()} مِداد | MEDAD — {t('footer.rights')}</span>
            <span>{t('footer.independent')}</span>
          </div>
        </footer>
      )}

      <div className="toasts">
        {toasts.map((x) => (
          <div key={x.id} className={`toast ${x.type === 'error' ? 'error' : ''}`}>{x.message}</div>
        ))}
      </div>
    </div>
  )
}
