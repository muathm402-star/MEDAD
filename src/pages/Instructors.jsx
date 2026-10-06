import { Link, useParams } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Avatar } from '../components/UI'
import CourseCard from '../components/CourseCard'

export function Instructors() {
  const { instructors, loc, t, state } = useApp()
  const list = instructors()
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('nav.instructors')}</h1>
          <p>{t('home.instructors')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container grid-3">
          {list.map((u) => (
            <Link key={u.id} to={`/instructors/${u.id}`} className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}><Avatar user={u} size="lg" /></div>
                <h3>{loc(u, 'name')}</h3>
                <p className="muted">{loc(u, 'title')}</p>
                <p className="small">{loc(u, 'city')}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

export function InstructorProfile() {
  const { id } = useParams()
  const { userById, loc, state, t } = useApp()
  const u = userById(id)
  if (!u) return <div className="section container"><div className="empty">—</div></div>
  const courses = state.courses.filter((c) => c.instructorId === u.id)
  return (
    <>
      <div className="page-hero">
        <div className="container gap">
          <Avatar user={u} size="lg" />
          <div>
            <h1>{loc(u, 'name')}</h1>
            <p>{loc(u, 'title')} · {loc(u, 'city')}</p>
          </div>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <p style={{ maxWidth: 720 }}>{loc(u, 'bio')}</p>
          <h2 className="mt-2">{t('nav.courses')}</h2>
          <div className="grid-3">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      </section>
    </>
  )
}
