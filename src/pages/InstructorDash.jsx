import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Button, Empty, Field, ProgressBar } from '../components/UI'

export default function InstructorDash() {
  const app = useApp()
  const { user, t, state, loc, progressOf, instructorMarkComplete, addLesson, toast } = app
  const [tab, setTab] = useState('courses')
  const [lessonForm, setLessonForm] = useState({ courseId: '', title: '', content: '', durationMin: 20 })

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'instructor' && user.role !== 'admin') {
    return <div className="section container"><Empty title={state.lang === 'en' ? 'Instructor access only.' : 'هذه المساحة للمدربين.'} /></div>
  }

  const myCourses = user.role === 'admin' ? state.courses : state.courses.filter((c) => c.instructorId === user.id)
  const myEns = state.enrollments.filter((e) => myCourses.some((c) => c.id === e.courseId))

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('instructor.title')}</h1>
          <p>{loc(user, 'name')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container dash-grid">
          <nav className="dash-nav">
            {['courses', 'students', 'lessons', 'exams'].map((k) => (
              <button key={k} className={tab === k ? 'active' : ''} type="button" onClick={() => setTab(k)}>
                {k === 'courses' ? t('instructor.myCourses') : k === 'students' ? t('instructor.students') : k === 'lessons' ? t('nav.courses') + ' / ' + 'دروس' : t('nav.exams')}
              </button>
            ))}
          </nav>
          <div>
            {tab === 'courses' ? (
              <div className="grid-2">
                {myCourses.map((c) => {
                  const n = myEns.filter((e) => e.courseId === c.id).length
                  return (
                    <div className="card" key={c.id}>
                      <div className="card-body">
                        <h3>{loc(c, 'title')}</h3>
                        <p className="muted">{n} {t('common.students')} · {c.lessons.length} {t('common.lessons')}</p>
                        <Link to={`/courses/${c.slug}`}>{t('common.view')}</Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}

            {tab === 'students' ? (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>{t('common.name')}</th>
                      <th>{t('nav.courses')}</th>
                      <th>{t('dash.progress')}</th>
                      <th>{t('instructor.completion')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myEns.map((e) => {
                      const st = state.users.find((u) => u.id === e.userId)
                      const c = state.courses.find((x) => x.id === e.courseId)
                      return (
                        <tr key={e.id}>
                          <td>{st ? loc(st, 'name') : e.userId}</td>
                          <td>{c ? loc(c, 'title') : ''}</td>
                          <td style={{ minWidth: 140 }}><ProgressBar value={progressOf(e)} /></td>
                          <td>
                            <Button size="sm" variant="outline" onClick={() => { instructorMarkComplete(e.userId, e.courseId); toast(t('common.success')) }}>
                              {t('instructor.completion')}
                            </Button>
                            {e.examPassed ? <span className="badge badge-ok">{t('instructor.eligibility')}</span> : null}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {myEns.length === 0 ? <Empty title={t('common.empty')} /> : null}
              </div>
            ) : null}

            {tab === 'lessons' ? (
              <div>
                <form
                  className="card mb"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!lessonForm.courseId || !lessonForm.title) return
                    addLesson(lessonForm.courseId, {
                      title: lessonForm.title,
                      titleEn: lessonForm.title,
                      content: lessonForm.content,
                      contentEn: lessonForm.content,
                      durationMin: Number(lessonForm.durationMin) || 20,
                      type: 'reading',
                    })
                    toast(t('common.success'))
                    setLessonForm({ ...lessonForm, title: '', content: '' })
                  }}
                >
                  <div className="card-body">
                    <h3>{t('common.add')}</h3>
                    <Field label={t('nav.courses')}>
                      <select className="select" value={lessonForm.courseId} onChange={(e) => setLessonForm({ ...lessonForm, courseId: e.target.value })}>
                        <option value="">—</option>
                        {myCourses.map((c) => <option key={c.id} value={c.id}>{loc(c, 'title')}</option>)}
                      </select>
                    </Field>
                    <Field label={t('common.name')}><input className="input" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} /></Field>
                    <Field label=""><textarea className="textarea" value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} /></Field>
                    <Button type="submit">{t('common.add')}</Button>
                  </div>
                </form>
                {myCourses.map((c) => (
                  <div key={c.id} className="mb">
                    <h3>{loc(c, 'title')}</h3>
                    {c.lessons.map((l) => (
                      <div className="lesson-item" key={l.id}>
                        <div className="lesson-num">{l.order}</div>
                        <div>{loc(l, 'title')}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}

            {tab === 'exams' ? (
              <div className="grid-2">
                {state.exams.filter((ex) => myCourses.some((c) => c.id === ex.courseId)).map((ex) => (
                  <div className="card" key={ex.id}>
                    <div className="card-body">
                      <h3>{loc(ex, 'title')}</h3>
                      <p>{ex.questions.length} · {ex.passingScore}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}
