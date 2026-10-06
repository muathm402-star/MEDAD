import { Link, Navigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import CertificateView from '../components/CertificateView'
import { Button, Empty } from '../components/UI'

export default function Certificates() {
  const { code } = useParams()
  const { user, t, certificatesOf, state, loc } = useApp()
  if (!user) return <Navigate to="/login" replace />
  const mine = user.role === 'admin' ? state.certificates : certificatesOf(user.id)
  const current = code ? state.certificates.find((c) => c.code === code) : mine[0]

  if (code && current) {
    return (
      <section className="section">
        <div className="container">
          <div className="split no-print mb">
            <Link to="/certificates">{t('common.back')}</Link>
            <Button onClick={() => window.print()}>{t('common.print')}</Button>
          </div>
          <CertificateView certificate={current} />
        </div>
      </section>
    )
  }

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('cert.title')}</h1>
          <p>{t('cert.verifiable')} — {t('cert.type')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {mine.length === 0 ? (
            <Empty title={t('cert.empty')}>
              <Link to="/courses"><Button className="mt">{t('dash.browse')}</Button></Link>
            </Empty>
          ) : (
            <div className="grid-2">
              {mine.map((c) => {
                const course = state.courses.find((x) => x.id === c.courseId)
                const holder = state.users.find((u) => u.id === c.userId)
                return (
                  <div className="card" key={c.id}>
                    <div className="card-body">
                      <div className="split">
                        <strong>{c.code}</strong>
                        <span className={`badge ${c.status === 'valid' ? 'badge-ok' : 'badge-bad'}`}>{c.status}</span>
                      </div>
                      <p>{course ? loc(course, 'title') : ''}</p>
                      <p className="small muted">{holder ? loc(holder, 'name') : ''} · {new Date(c.issuedAt).toLocaleDateString()}</p>
                      <Link to={`/certificates/${c.code}`}><Button size="sm">{t('common.view')}</Button></Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
