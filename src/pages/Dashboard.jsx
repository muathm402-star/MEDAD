import { Link, Navigate } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Badge, Button, Empty, ProgressBar } from '../components/UI'
import CourseCard from '../components/CourseCard'

export default function Dashboard() {
  const { user, t, loc, state, enrollmentsOf, progressOf, lessonsComplete, examByCourse, certificatesOf, notificationsOf, markNotificationRead, pathProgress } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'instructor') return <Navigate to="/instructor" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />

  const ens = enrollmentsOf(user.id)
  const certs = certificatesOf(user.id)
  const notes = notificationsOf(user.id)
  const completed = ens.filter((e) => e.examPassed)
  const upcoming = ens.filter((e) => !e.examPassed).map((e) => {
    const course = state.courses.find((c) => c.id === e.courseId)
    const exam = examByCourse(e.courseId)
    return { e, course, exam, ready: lessonsComplete(e) }
  })

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('dash.welcome')}، {loc(user, 'name')}</h1>
          <p>{user.title} · {user.city}</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="stats" style={{ marginTop: 0 }}>
            <div className="stat"><b>{ens.length}</b><span>{t('dash.enrolled')}</span></div>
            <div className="stat"><b>{completed.length}</b><span>{t('dash.completed')}</span></div>
            <div className="stat"><b>{certs.length}</b><span>{t('dash.certs')}</span></div>
            <div className="stat"><b>{upcoming.filter((x) => x.ready).length}</b><span>{t('dash.upcoming')}</span></div>
          </div>

          {notes.length ? (
            <div className="card mb mt">
              <div className="card-body">
                <h3 style={{ marginTop: 0 }}>{t('dash.notifications')}</h3>
                {notes.slice(0, 5).map((n) => (
                  <Link
                    key={n.id}
                    to={n.href || '/dashboard'}
                    className="note-item"
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <strong>{loc(n, 'title')}</strong>
                    <span className="small muted">{loc(n, 'body')}</span>
                    {!n.read ? <span className="badge badge-gold">•</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid-3 mt-2">
            {state.paths.map((p) => {
              const pp = pathProgress(user.id, p)
              return (
                <Link key={p.id} to={`/paths/${p.slug}`} className="card">
                  <div className="card-body">
                    <div className="eyebrow">{t('nav.paths')}</div>
                    <h3 style={{ fontSize: 18 }}>{loc(p, 'title')}</h3>
                    <div className="split small mb">
                      <span>{t('dash.progress')}</span>
                      <span>{pp.pct}% · {pp.done}/{pp.total}</span>
                    </div>
                    <ProgressBar value={pp.pct} />
                    <p className="small muted mt">{pp.remaining} {t('dash.remaining')}</p>
                  </div>
                </Link>
              )
            })}
          </div>

          <h2 className="mt-2">{t('dash.continueLearning')}</h2>
          {ens.length === 0 ? (
            <Empty title={t('dash.emptyEnroll')}>
              <Link to="/courses"><Button className="mt">{t('dash.browse')}</Button></Link>
            </Empty>
          ) : (
            <div className="grid-3">
              {ens.map((e) => {
                const c = state.courses.find((x) => x.id === e.courseId)
                if (!c) return null
                const p = progressOf(e)
                const next = c.lessons.find((l) => !e.completedLessonIds.includes(l.id)) || c.lessons[0]
                return (
                  <div key={e.id} className="card">
                    <div className="card-media"><img src={c.image} alt="" /></div>
                    <div className="card-body">
                      <h3>{loc(c, 'title')}</h3>
                      <div className="split small mb"><span>{t('dash.progress')}</span><span>{p}%</span></div>
                      <ProgressBar value={p} />
                      <div className="gap mt">
                        <Link to={`/learn/${c.id}/${next.id}`}><Button size="sm">{t('common.continue')}</Button></Link>
                        {e.examPassed ? <Badge tone="ok">{t('dash.passed')}</Badge> : lessonsComplete(e) ? <Link to={`/exams/${c.id}`}><Badge tone="gold">{t('dash.examReady')}</Badge></Link> : <Badge>{t('dash.examLocked')}</Badge>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <h2 className="mt-2">{t('dash.upcoming')}</h2>
          {upcoming.length === 0 ? <p className="muted">{t('common.empty')}</p> : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>{t('nav.courses')}</th>
                    <th>{t('dash.progress')}</th>
                    <th>{t('common.status')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(({ e, course, ready }) => (
                    <tr key={e.id}>
                      <td>{course ? loc(course, 'title') : e.courseId}</td>
                      <td>{progressOf(e)}%</td>
                      <td>{ready ? t('dash.examReady') : t('dash.examLocked')}</td>
                      <td>{ready && course ? <Link to={`/exams/${course.id}`}>{t('exam.start')}</Link> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="split mt-2">
            <h2 style={{ margin: 0 }}>{t('dash.certs')}</h2>
            <Link to="/certificates">{t('common.view')}</Link>
          </div>
          {certs.length === 0 ? <p className="muted">{t('cert.empty')}</p> : (
            <ul>
              {certs.map((c) => {
                const course = state.courses.find((x) => x.id === c.courseId)
                return <li key={c.id}><Link to={`/certificates/${c.code}`}>{c.code}</Link> — {course ? loc(course, 'title') : ''} · {c.status}</li>
              })}
            </ul>
          )}

          <h2 className="mt-2">{t('nav.courses')}</h2>
          <div className="grid-3">
            {state.courses.filter((c) => !ens.some((e) => e.courseId === c.id)).slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      </section>
    </>
  )
}
