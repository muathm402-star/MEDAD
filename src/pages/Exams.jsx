import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Badge, Button, Empty } from '../components/UI'

export function ExamsList() {
  const { user, t, state, loc, enrollmentsOf, lessonsComplete } = useApp()
  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('exam.title')}</h1>
          <p>{t('exam.subtitle')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {state.exams.length === 0 ? <Empty title={t('common.empty')} /> : (
            <div className="grid-2">
              {state.exams.map((ex) => {
                const course = state.courses.find((c) => c.id === ex.courseId)
                const mine = user.role === 'student'
                  ? enrollmentsOf(user.id).find((e) => e.courseId === ex.courseId)
                  : state.enrollments.find((e) => e.courseId === ex.courseId)
                const ready = mine && lessonsComplete(mine)
                return (
                  <div className="card" key={ex.id}>
                    <div className="card-body">
                      <h3>{loc(ex, 'title')}</h3>
                      <p className="muted">{course ? loc(course, 'title') : ''}</p>
                      <p className="small">{t('exam.time')}: {ex.timeLimitMin} {t('exam.minutes')} · {ex.passingScore}%</p>
                      {mine?.examPassed ? <Badge tone="ok">{t('dash.passed')}</Badge> : ready ? <Badge tone="gold">{t('dash.examReady')}</Badge> : <Badge>{t('dash.examLocked')}</Badge>}
                      <div className="mt">
                        {ready && user.role === 'student' ? <Link to={`/exams/${ex.courseId}`}><Button size="sm">{t('exam.start')}</Button></Link> : null}
                        {user.role !== 'student' && course ? <Link to={`/courses/${course.slug}`} className="small">{t('common.view')}</Link> : null}
                      </div>
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

export function TakeExam() {
  const { courseId } = useParams()
  const nav = useNavigate()
  const { user, t, loc, examByCourse, enrollment, lessonsComplete, submitExam, issueCertificate, toast, courseById } = useApp()
  const exam = examByCourse(courseId)
  const course = courseById(courseId)
  const [answers, setAnswers] = useState({})
  const [outcome, setOutcome] = useState(null)
  const [left, setLeft] = useState(null)
  const answersRef = useRef(answers)
  answersRef.current = answers
  const outcomeRef = useRef(outcome)
  outcomeRef.current = outcome

  useEffect(() => {
    if (exam && left == null) setLeft(exam.timeLimitMin * 60)
  }, [exam, left])

  useEffect(() => {
    if (!exam || outcome || left == null) return undefined
    const id = setInterval(() => {
      setLeft((s) => {
        if (s == null) return s
        if (s <= 1) {
          clearInterval(id)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [exam, outcome, left == null])

  useEffect(() => {
    if (left !== 0 || left == null || outcomeRef.current || !exam || !user) return
    const res = submitExam(user.id, courseId, answersRef.current)
    setOutcome(res)
    toast(t('exam.timeout'), 'error')
  }, [left, exam, user, courseId, submitExam, toast, t])

  if (!user) return <Navigate to="/login" replace />
  if (!exam || !course) return <div className="section container"><Empty title="—" /></div>
  const en = enrollment(user.id, courseId)
  if (!en || !lessonsComplete(en)) {
    return (
      <div className="section container">
        <Empty title={t('dash.examLocked')}>
          <Link to={`/courses/${course.slug}`}><Button className="mt">{t('common.back')}</Button></Link>
        </Empty>
      </div>
    )
  }

  const finish = (payload) => {
    const res = submitExam(user.id, courseId, payload)
    setOutcome(res)
    if (res.passed) toast(t('exam.pass'))
    else toast(t('exam.fail'), 'error')
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (exam.questions.some((q) => answers[q.id] == null)) {
      toast(t('exam.unanswered'), 'error')
      return
    }
    finish(answers)
  }

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="split">
          <div>
            <h1>{loc(exam, 'title')}</h1>
            <p className="muted">{loc(course, 'title')} · {exam.passingScore}%</p>
          </div>
          {!outcome && left != null ? (
            <div className={`exam-timer ${left < 60 ? 'low' : ''}`}>
              <span className="small muted">{t('exam.timeLeft')}</span>
              <strong>{mm}:{ss}</strong>
            </div>
          ) : null}
        </div>
        {outcome ? (
          <div className={`verify-result ${outcome.passed ? 'valid' : 'invalid'} mb`}>
            <h2>{t('exam.score')}: {outcome.score}%</h2>
            <p>{outcome.passed ? t('exam.pass') : t('exam.fail')}</p>
            {outcome.passed ? (
              <Button
                className="mt"
                onClick={() => {
                  const r = issueCertificate(user.id, courseId)
                  if (r.ok) {
                    toast(t('common.success'))
                    nav(`/certificates/${r.certificate.code}`)
                  } else toast(r.error, 'error')
                }}
              >
                {t('exam.issueCert')}
              </Button>
            ) : (
              <Button className="mt" variant="outline" onClick={() => { setOutcome(null); setAnswers({}); setLeft(exam.timeLimitMin * 60) }}>{t('dash.failed')}</Button>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            {exam.questions.map((q, i) => (
              <div className="q-item" key={q.id}>
                <strong>{i + 1}. {loc(q, 'text')}</strong>
                {(loc(q, 'options') || q.options).map((opt, idx) => (
                  <label key={idx} className={`opt ${answers[q.id] === idx ? 'on' : ''}`}>
                    <input type="radio" name={q.id} checked={answers[q.id] === idx} onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx }))} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ))}
            <Button type="submit">{t('exam.submit')}</Button>
          </form>
        )}
      </div>
    </section>
  )
}
