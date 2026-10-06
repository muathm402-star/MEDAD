import { Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../store/AppStore'
import { Avatar, Button, Field } from '../components/UI'

export default function Profile() {
  const { user, t, updateProfile, toast, loc, enrollmentsOf, certificatesOf, progressOf } = useApp()
  const [form, setForm] = useState(() => (user ? { name: user.name, phone: user.phone, city: user.city, bio: user.bio, title: user.title } : {}))
  if (!user) return <Navigate to="/login" replace />
  const ens = enrollmentsOf(user.id)
  const certs = certificatesOf(user.id)
  const avg = ens.length ? Math.round(ens.reduce((a, e) => a + progressOf(e), 0) / ens.length) : 0

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="gap mb">
          <Avatar user={user} size="lg" />
          <div>
            <h1>{loc(user, 'name')}</h1>
            <p className="muted">{user.email} · {t(`common.${user.role === 'student' ? 'student' : user.role === 'admin' ? 'adminRole' : 'instructorRole'}`)}</p>
            <div className="gap mt">
              {user.role === 'student' ? <Link to="/dashboard"><Button size="sm" variant="outline">{t('nav.dashboard')}</Button></Link> : null}
              {user.role === 'instructor' || user.role === 'admin' ? <Link to="/instructor"><Button size="sm" variant="outline">{t('nav.instructor')}</Button></Link> : null}
              {user.role === 'admin' ? <Link to="/admin"><Button size="sm">{t('nav.admin')}</Button></Link> : null}
            </div>
          </div>
        </div>
        <div className="stats mb" style={{ marginTop: 0 }}>
          <div className="stat"><b>{ens.length}</b><span>{t('dash.enrolled')}</span></div>
          <div className="stat"><b>{avg}%</b><span>{t('dash.progress')}</span></div>
          <div className="stat"><b>{certs.length}</b><span>{t('dash.certs')}</span></div>
          <div className="stat"><b>{ens.filter((e) => e.examPassed).length}</b><span>{t('dash.completed')}</span></div>
        </div>
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault()
            updateProfile(user.id, { ...form, nameEn: form.name })
            toast(t('common.success'))
          }}
        >
          <div className="card-body">
            <Field label={t('common.name')}><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label={t('common.phone')}><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label={t('common.city')}><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label={t('common.details')}><textarea className="textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field>
            <Button type="submit">{t('common.save')}</Button>
          </div>
        </form>
      </div>
    </section>
  )
}
