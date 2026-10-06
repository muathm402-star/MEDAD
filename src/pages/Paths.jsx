import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Badge, Button, LevelBadge, ProgressBar } from '../components/UI'
import CourseCard from '../components/CourseCard'

export function Paths() {
  const { state, t, loc } = useApp()
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('nav.paths')}</h1>
          <p>{t('home.pathsSub')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container grid-3">
          {state.paths.map((p) => (
            <Link key={p.id} to={`/paths/${p.slug}`} className="card">
              <div className="card-media"><img src={p.image} alt="" /></div>
              <div className="card-body">
                <LevelBadge level={p.level} t={t} />
                <h3>{loc(p, 'title')}</h3>
                <p className="muted">{loc(p, 'description').slice(0, 160)}…</p>
                <div className="card-foot">
                  <span>{p.courseIds.length} {t('nav.courses')}</span>
                  <span>{p.durationHours} {t('common.hours')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

export function PathDetails() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { state, loc, t, user, enrollment, progressOf, enrollPath, toast, pathProgress } = useApp()
  const path = state.paths.find((p) => p.slug === slug)
  if (!path) return <div className="section container"><div className="empty">—</div></div>
  const courses = path.courseIds.map((id) => state.courses.find((c) => c.id === id)).filter(Boolean)
  const pp = user ? pathProgress(user.id, path) : { pct: 0, done: 0, remaining: courses.length, total: courses.length }
  const overall = pp.pct
  const allEnrolled = user && courses.every((c) => enrollment(user.id, c.id))

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <LevelBadge level={path.level} t={t} />
          <h1>{loc(path, 'title')}</h1>
          <p>{loc(path, 'description')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="split mb">
            <div>
              <div className="small muted">{t('dash.progress')}</div>
              <strong>{overall}%</strong>
              <div className="small muted">{pp.done}/{pp.total} · {pp.remaining} {t('dash.remaining')}</div>
            </div>
            <div className="gap">
              <Badge tone="gold">{path.durationHours} {t('common.hours')}</Badge>
              {allEnrolled ? (
                <Badge tone="ok">{t('paths.enrolled')}</Badge>
              ) : (
                <Button
                  onClick={() => {
                    if (!user) {
                      nav('/login')
                      return
                    }
                    enrollPath(user.id, path.id)
                    toast(t('courses.enrollOk'))
                  }}
                >
                  {t('paths.enrollAll')}
                </Button>
              )}
            </div>
          </div>
          <ProgressBar value={overall} />
          <h2 className="mt-2">{t('courses.objectives')}</h2>
          <ul>
            {(state.lang === 'en' ? path.outcomesEn : path.outcomes).map((o) => <li key={o}>{o}</li>)}
          </ul>
          <h2>{t('nav.courses')}</h2>
          <div className="path-steps mb">
            {courses.map((c, i) => {
              const en = user ? enrollment(user.id, c.id) : null
              const p = en ? progressOf(en) : 0
              return (
                <Link key={c.id} to={`/courses/${c.slug}`} className="path-step">
                  <div className={`lesson-num ${p === 100 ? 'done' : ''}`}>{i + 1}</div>
                  <div>
                    <strong>{loc(c, 'title')}</strong>
                    <div className="small muted">{p}%</div>
                  </div>
                  <Button size="sm" variant="outline">{t('common.view')}</Button>
                </Link>
              )
            })}
          </div>
          <div className="grid-3">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      </section>
    </>
  )
}
