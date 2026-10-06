import { useState } from 'react'
import { useApp } from '../store/AppStore'
import { Button, Field } from '../components/UI'

export default function Contact() {
  const { t, state, toast } = useApp()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('contact.title')}</h1>
          <p>{state.lang === 'en' ? state.settings.addressEn : state.settings.address}</p>
        </div>
      </div>
      <section className="section">
        <div className="container grid-2">
          <form
            className="card"
            onSubmit={(e) => {
              e.preventDefault()
              if (!form.name || !form.email || !form.message) {
                toast(t('common.required'), 'error')
                return
              }
              setSent(true)
              toast(t('contact.sent'))
            }}
          >
            <div className="card-body">
              <Field label={t('common.name')}><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label={t('common.email')}><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label={t('contact.message')}><textarea className="textarea" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
              {sent ? <p className="form-ok">{t('contact.sent')}</p> : <Button type="submit">{t('contact.send')}</Button>}
            </div>
          </form>
          <div>
            <h2>{t('brand')}</h2>
            <p>{state.settings.contactEmail}</p>
            <p>{state.settings.contactPhone}</p>
            <p>{state.lang === 'en' ? state.settings.addressEn : state.settings.address}</p>
            <p className="muted small">{state.lang === 'en' ? state.homepage.accreditationNoteEn : state.homepage.accreditationNote}</p>
          </div>
        </div>
      </section>
    </>
  )
}
