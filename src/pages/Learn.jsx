import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Button, ProgressBar } from '../components/UI'

export default function Learn() {
  const { courseId, lessonId } = useParams()
  const nav = useNavigate()
  const { state, user, loc, t, enrollment, completeLesson, progressOf, lessonsComplete, toast } = useApp()
  const course = state.courses.find((c) => c.id === courseId)
  if (!course) return <div className="section container"><div className="empty">—</div></div>
  if (!user) return <Navigate to="/login" replace />
  const en = enrollment(user.id, course.id)
  if (!en) {
    return (
      <div className="section container">
        <div className="empty">
          <p>{t('learn.locked')}</p>
          <Link to={`/courses/${course.slug}`}><Button>{t('common.enroll')}</Button></Link>
        </div>
      </div>
    )
  }
  const lesson = course.lessons.find((l) => l.id === lessonId) || course.lessons[0]
  if (lesson && lesson.id !== lessonId) return <Navigate to={`/learn/${course.id}/${lesson.id}`} replace />
  const done = en.completedLessonIds.includes(lesson.id)
  const all = lessonsComplete(en)
  const idx = course.lessons.findIndex((l) => l.id === lesson.id)
  const next = course.lessons[idx + 1]
  const prev = course.lessons[idx - 1]
  const kind = lesson.type === 'lab' ? 'lab' : lesson.type === 'video' ? 'video' : 'reading'

  return (
    <div className="learn-layout">
      <aside className="learn-side">
        <Link to={`/courses/${course.slug}`} className="small" style={{ opacity: 0.7 }}>{loc(course, 'title')}</Link>
        <div className="split" style={{ margin: '8px 0 14px' }}>
          <strong>{progressOf(en)}%</strong>
        </div>
        <ProgressBar value={progressOf(en)} />
        <div className="mt">
          {course.lessons.map((l) => (
            <Link key={l.id} to={`/learn/${course.id}/${l.id}`} className={l.id === lesson.id ? 'active' : ''}>
              {en.completedLessonIds.includes(l.id) ? '✓ ' : `${l.order}. `}
              {loc(l, 'title')}
            </Link>
          ))}
        </div>
        {all ? (
          <Link to={`/exams/${course.id}`}><Button variant="gold" block className="mt">{t('learn.takeExam')}</Button></Link>
        ) : null}
      </aside>
      <div className="learn-content">
        <div className="eyebrow">{t(`learn.${kind}`)} · {t('common.lesson')} {lesson.order} · {lesson.durationMin} {t('exam.minutes')}</div>
        <h1>{loc(lesson, 'title')}</h1>
        <div className="player">
          <img src={course.image} alt="" />
          <div className="player-copy">
            <div className="player-disc">{kind === 'lab' ? '🔬' : kind === 'video' ? '▶' : '▣'}</div>
            <div>{t(`learn.${kind}`)}</div>
            <p className="small" style={{ opacity: 0.75 }}>{t('learn.play')} · {lesson.durationMin} {t('exam.minutes')}</p>
          </div>
        </div>
        <div className="prose">
          <p>{loc(lesson, 'content')}</p>
        </div>
        <div className="gap mt-2">
          {prev ? <Button variant="outline" onClick={() => nav(`/learn/${course.id}/${prev.id}`)}>{t('common.previous')}</Button> : null}
          {!done ? (
            <Button
              variant="teal"
              onClick={() => {
                completeLesson(user.id, course.id, lesson.id)
                toast(t('learn.completed'))
                if (next) nav(`/learn/${course.id}/${next.id}`)
              }}
            >
              {t('learn.markComplete')}
            </Button>
          ) : (
            <span className="badge badge-ok">{t('learn.completed')}</span>
          )}
          {next ? <Button onClick={() => nav(`/learn/${course.id}/${next.id}`)}>{t('common.next')}</Button> : null}
        </div>
        {all ? (
          <div className="verify-result valid mt">
            <p className="form-ok" style={{ margin: 0 }}>{t('learn.allDone')}</p>
            <Link to={`/exams/${course.id}`}><Button variant="gold" className="mt">{t('learn.takeExam')}</Button></Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
