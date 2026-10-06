import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Button, Field } from '../components/UI'

export default function Verify() {
  const { code: param } = useParams()
  const { t, loc, findCertificate, userById, courseById, state, logVerification } = useApp()
  const [code, setCode] = useState(param || '')
  const [result, setResult] = useState(null)
  const [searched, setSearched] = useState(false)

  const run = (value) => {
    const c = findCertificate(value)
    setSearched(true)
    setResult(c || null)
    logVerification(String(value || '').trim().toUpperCase(), c ? (c.status === 'revoked' ? 'revoked' : 'valid') : 'invalid')
  }

  useEffect(() => {
    if (param) {
      setCode(param)
      run(param)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param])

  const holder = result ? userById(result.userId) : null
  const course = result ? courseById(result.courseId) : null
  const instructor = result ? userById(result.instructorId) : null
  const status = !searched ? null : !result ? 'invalid' : result.status === 'revoked' ? 'revoked' : 'valid'

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="kicker" style={{ color: 'var(--gold-200)' }}>{t('cert.verifiable')}</div>
          <h1>{t('cert.verifyTitle')}</h1>
          <p>{t('cert.verifySub')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <form
            className="card"
            onSubmit={(e) => {
              e.preventDefault()
              run(code)
            }}
          >
            <div className="card-body">
              <Field label={t('cert.id')}>
                <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('cert.placeholder')} />
              </Field>
              <Button type="submit">{t('cert.check')}</Button>
              <p className="small muted mt">{t('cert.demoHint')}</p>
            </div>
          </form>

          {searched && status === 'invalid' ? (
            <div className="verify-result invalid mt-2">
              <h2>{t('cert.invalid')}</h2>
              <p className="muted">{t('cert.result')}: {code || '—'}</p>
              <p className="small muted">{state.lang === 'en' ? state.homepage.accreditationNoteEn : state.homepage.accreditationNote}</p>
            </div>
          ) : null}

          {result ? (
            <div className={`verify-result ${status === 'valid' ? 'valid' : 'invalid'} mt-2`}>
              <div className="split">
                <h2 style={{ margin: 0 }}>{status === 'valid' ? t('cert.valid') : t('cert.revoked')}</h2>
                <span className={`badge ${status === 'valid' ? 'badge-ok' : 'badge-bad'}`}>{t('cert.type')}</span>
              </div>
              <p className="small gold">{t('cert.verifiable')} · {window.location.origin}/verify/{result.code}</p>
              <div className="grid-2 mt">
                <div><div className="small muted">{t('cert.holder')}</div><strong>{holder ? loc(holder, 'name') : '—'}</strong></div>
                <div><div className="small muted">{t('cert.course')}</div><strong>{course ? loc(course, 'title') : '—'}</strong></div>
                <div><div className="small muted">{t('common.instructor')}</div><strong>{instructor ? loc(instructor, 'name') : '—'}</strong></div>
                <div><div className="small muted">{t('cert.issued')}</div><strong>{new Date(result.issuedAt).toLocaleDateString(state.lang === 'en' ? 'en-GB' : 'ar-YE')}</strong></div>
                <div><div className="small muted">{t('cert.id')}</div><strong>{result.code}</strong></div>
                <div><div className="small muted">{t('common.status')}</div><strong>{result.status}</strong></div>
              </div>
              {status === 'valid' ? <Link className="mt" to={`/certificates/${result.code}`} style={{ display: 'inline-block', marginTop: 16 }}>{t('common.view')}</Link> : null}
              {state.settings.accreditationEnabled && state.settings.accreditationBody ? (
                <p className="mt small">{state.lang === 'en' ? state.settings.accreditationBodyEn : state.settings.accreditationBody}</p>
              ) : (
                <p className="mt small muted">{state.lang === 'en' ? state.homepage.accreditationNoteEn : state.homepage.accreditationNote}</p>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
