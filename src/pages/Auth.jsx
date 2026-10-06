import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Button, Field } from '../components/UI'

export function Login() {
  const { login, t, toast } = useApp()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const res = await login(email, password)
    if (!res.ok) {
      setErr(res.error || t('auth.fail'))
      return
    }
    toast(t('common.success'))
    const role = res.user.role
    if (role === 'admin') nav('/admin')
    else if (role === 'instructor') nav('/instructor')
    else nav(loc.state?.from || '/dashboard')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-visual">
        <div className="copy">
          <div className="kicker">مِداد | MEDAD</div>
          <h1 style={{ color: '#fbf9f4' }}>{t('tagline')}</h1>
          <p>{t('auth.demo')}</p>
        </div>
      </div>
      <div className="auth-panel">
        <h1>{t('auth.loginTitle')}</h1>
        <form onSubmit={submit}>
          <Field label={t('common.email')}><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          <Field label={t('common.password')}><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
          {err ? <div className="form-error mb">{err}</div> : null}
          <Button block type="submit">{t('nav.login')}</Button>
        </form>
        <p className="mt">{t('auth.noAccount')} <Link to="/register">{t('nav.register')}</Link></p>
      </div>
    </div>
  )
}

export function Register() {
  const { register, t, toast } = useApp()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', city: '' })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setErr(t('common.required'))
      return
    }
    const res = await register(form)
    if (!res.ok) { setErr(res.error); return }
    toast(res.needsConfirmation ? 'تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتفعيل الحساب.' : t('auth.registered'))
    nav(res.needsConfirmation ? '/login' : '/dashboard')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-visual">
        <div className="copy">
          <h1 style={{ color: '#fbf9f4' }}>مِداد</h1>
          <p>{t('home.finalCtaSub')}</p>
        </div>
      </div>
      <div className="auth-panel">
        <h1>{t('auth.registerTitle')}</h1>
        <form onSubmit={submit}>
          <Field label={t('common.name')}><input className="input" value={form.name} onChange={set('name')} placeholder={t('auth.namePh')} required /></Field>
          <Field label={t('common.email')}><input className="input" type="email" value={form.email} onChange={set('email')} required /></Field>
          <Field label={t('common.password')}><input className="input" type="password" value={form.password} onChange={set('password')} required /></Field>
          <Field label={t('common.phone')}><input className="input" value={form.phone} onChange={set('phone')} /></Field>
          <Field label={t('common.city')}><input className="input" value={form.city} onChange={set('city')} /></Field>
          {err ? <div className="form-error mb">{err}</div> : null}
          <Button block type="submit">{t('nav.register')}</Button>
        </form>
        <p className="mt">{t('auth.hasAccount')} <Link to="/login">{t('nav.login')}</Link></p>
      </div>
    </div>
  )
}
