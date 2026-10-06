import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Avatar, Badge, Button, LevelBadge, ProgressBar, Stars } from '../components/UI'

export default function CourseDetails() {
  const { slug } = useParams()
  const nav = useNavigate()
  const app = useApp()
  const { state, t, loc, userById, categoryById, enrollment, progressOf, enroll, toast, user } = app
  const course = state.courses.find((c) => c.slug === slug)
  if (!course) {
    return <div className="section container"><div className="empty">{state.lang === 'en' ? 'Course not found.' : 'الدورة غير موجودة.'}</div></div>
  }
  const inst = userById(course.instructorId)
  const cat = categoryById(course.categoryId)
  const en = user ? enrollment(user.id, course.id) : null
  const progress = progressOf(en)

  const onEnroll = () => {
    if (!user) {
      toast(t('courses.loginFirst'), 'error')
      nav('/login')
      return
    }
    enroll(user.id, course.id)
    toast(t('courses.enrollOk'))
  }

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="card-meta">
            <Badge tone="gold">{loc(cat || {}, 'name')}</Badge>
            <LevelBadge level={course.level} t={t} />
          </div>
          <h1>{loc(course, 'title')}</h1>
          <p>{loc(course, 'description')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container course-layout">
          <div>
            <div className="course-hero-media mb"><img src={course.image} alt="" /></div>
            <h2>{t('courses.objectives')}</h2>
            <ul>
              {(state.lang === 'en' ? course.objectivesEn : course.objectives).map((o) => <li key={o}>{o}</li>)}
            </ul>
            <h2>{t('courses.requirements')}</h2>
            <ul>
              {(state.lang === 'en' ? course.requirementsEn : course.requirements).map((o) => <li key={o}>{o}</li>)}
            </ul>
            <h2>{t('courses.curriculum')}</h2>
            {course.lessons.map((l) => (
              <div className="lesson-item" key={l.id}>
                <div className={`lesson-num ${en?.completedLessonIds.includes(l.id) ? 'done' : ''}`}>{l.order}</div>
                <div>
                  <strong>{loc(l, 'title')}</strong>
                  <div className="small muted">{l.durationMin} {t('exam.minutes')} · {l.type}</div>
                </div>
              </div>
            ))}
            {inst ? (
              <div className="card mt-2">
                <div className="card-body gap">
                  <Avatar user={inst} />
                  <div>
                    <div className="eyebrow">{t('courses.aboutInstructor')}</div>
                    <h3 style={{ margin: 0 }}>{loc(inst, 'name')}</h3>
                    <p className="muted">{loc(inst, 'title')}</p>
                    <p>{loc(inst, 'bio')}</p>
                    <Link to={`/instructors/${inst.id}`}>{t('common.details')}</Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <aside className="card side-card">
            <div className="price">{course.price === 0 ? t('common.free') : `$${course.price}`}</div>
            <p className="small muted">{t('courses.priceNote')}</p>
            <div className="card-foot mb">
              <Stars value={course.rating} />
              <span className="small">{course.ratingCount} · {course.enrolledCount} {t('common.students')}</span>
            </div>
            <p className="small">{course.durationHours} {t('common.hours')} · {course.lessons.length} {t('common.lessons')}</p>
            {en ? (
              <>
                <div className="split small"><span>{t('dash.progress')}</span><span>{progress}%</span></div>
                <ProgressBar value={progress} />
                <Link to={`/learn/${course.id}/${course.lessons[0]?.id || ''}`}>
                  <Button block className="mt">{t('common.continue')}</Button>
                </Link>
              </>
            ) : (
              <Button block className="mt" onClick={onEnroll}>{t('common.enroll')}</Button>
            )}
            <div className="mt">
              <Badge tone="ok">{t('courses.certificateYes')}</Badge>
            </div>
            {inst ? <p className="small mt">{t('common.instructor')}: {loc(inst, 'name')}</p> : null}
          </aside>
        </div>
      </section>
    </>
  )
}
