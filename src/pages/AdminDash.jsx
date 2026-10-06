import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Button, Empty, Field } from '../components/UI'

const TABS = [
  'overview', 'students', 'instructors', 'courses', 'lessons', 'categories',
  'paths', 'exams', 'questions', 'certificates', 'template', 'verification',
  'articles', 'homepage', 'branding', 'payments', 'settings',
]

export default function AdminDash() {
  const app = useApp()
  const {
    user, t, state, loc, toast, resetDemo,
    upsertCourse, removeCourse, upsertUser, removeUser, upsertCategory, removeCategory,
    upsertArticle, removeArticle, setCertificateStatus, updateHomepage, updateSettings,
    addLesson, updateLesson, removeLesson, upsertExam, addQuestion, updateQuestion, removeQuestion,
    upsertPath, removePath, updateCertificateTemplate,
  } = app
  const [tab, setTab] = useState('overview')

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') {
    return <div className="section container"><Empty title={state.lang === 'en' ? 'Administration only.' : 'هذه المساحة للإدارة فقط.'} /></div>
  }

  const students = state.users.filter((u) => u.role === 'student')
  const instructors = state.users.filter((u) => u.role === 'instructor')
  const tpl = state.certificateTemplate || {}

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('admin.title')}</h1>
          <p>مِداد CMS · {t('footer.independent')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container dash-grid">
          <nav className="dash-nav">
            {TABS.map((k) => (
              <button key={k} type="button" className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>
                {t(`admin.${k}`)}
              </button>
            ))}
          </nav>
          <div>
            {tab === 'overview' ? (
              <>
                <div className="stats" style={{ marginTop: 0 }}>
                  <div className="stat"><b>{students.length}</b><span>{t('admin.students')}</span></div>
                  <div className="stat"><b>{instructors.length}</b><span>{t('admin.instructors')}</span></div>
                  <div className="stat"><b>{state.courses.length}</b><span>{t('admin.courses')}</span></div>
                  <div className="stat"><b>{state.certificates.length}</b><span>{t('admin.certificates')}</span></div>
                </div>
                <p className="muted mt">
                  {state.enrollments.length} {t('dash.enrolled')} · {state.exams.length} {t('admin.exams')} · {(state.verificationLogs || []).length} {t('admin.verification')}
                </p>
                <p className="small muted">{state.lang === 'en' ? 'Accreditation display is OFF unless enabled in Settings.' : 'عرض الاعتماد متوقف ما لم يُفعَّل من الإعدادات.'}</p>
              </>
            ) : null}

            {tab === 'students' || tab === 'instructors' ? (
              <PeopleTable
                people={tab === 'students' ? students : instructors}
                role={tab === 'students' ? 'student' : 'instructor'}
                t={t}
                loc={loc}
                onSave={(rec) => { upsertUser(rec); toast(t('common.success')) }}
                onRemove={(id) => { removeUser(id); toast(t('common.success')) }}
              />
            ) : null}

            {tab === 'courses' ? (
              <CoursesAdmin
                courses={state.courses}
                instructors={instructors}
                categories={state.categories}
                loc={loc}
                t={t}
                onSave={(c) => { upsertCourse(c); toast(t('common.success')) }}
                onRemove={(id) => { removeCourse(id); toast(t('common.success')) }}
              />
            ) : null}

            {tab === 'lessons' ? (
              <LessonsAdmin
                courses={state.courses}
                loc={loc}
                t={t}
                addLesson={addLesson}
                updateLesson={updateLesson}
                removeLesson={removeLesson}
                toast={toast}
              />
            ) : null}

            {tab === 'categories' ? (
              <div>
                <form
                  className="gap mb"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.target)
                    upsertCategory({ name: fd.get('name'), nameEn: fd.get('nameEn') || fd.get('name'), icon: 'cell' })
                    toast(t('common.success'))
                    e.target.reset()
                  }}
                >
                  <input className="input" name="name" placeholder="التصنيف" required />
                  <input className="input" name="nameEn" placeholder="Category" />
                  <Button size="sm" type="submit">{t('common.add')}</Button>
                </form>
                {state.categories.map((c) => (
                  <form
                    key={c.id}
                    className="gap mb"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.target)
                      upsertCategory({ id: c.id, name: fd.get('name'), nameEn: fd.get('nameEn') || c.nameEn, icon: c.icon })
                      toast(t('common.success'))
                    }}
                  >
                    <input className="input" name="name" defaultValue={c.name} />
                    <input className="input" name="nameEn" defaultValue={c.nameEn} />
                    <Button size="sm" type="submit">{t('common.save')}</Button>
                    <Button size="sm" variant="outline" type="button" onClick={() => { removeCategory(c.id); toast(t('common.success')) }}>{t('common.delete')}</Button>
                  </form>
                ))}
              </div>
            ) : null}

            {tab === 'paths' ? (
              <PathsAdmin paths={state.paths} courses={state.courses} loc={loc} t={t} onSave={upsertPath} onRemove={removePath} toast={toast} />
            ) : null}

            {tab === 'exams' ? (
              <ExamsAdmin exams={state.exams} courses={state.courses} loc={loc} t={t} upsertExam={upsertExam} toast={toast} />
            ) : null}

            {tab === 'questions' ? (
              <QuestionsAdmin exams={state.exams} courses={state.courses} loc={loc} t={t} addQuestion={addQuestion} updateQuestion={updateQuestion} removeQuestion={removeQuestion} toast={toast} />
            ) : null}

            {tab === 'certificates' ? (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>{t('cert.id')}</th>
                      <th>{t('cert.holder')}</th>
                      <th>{t('cert.course')}</th>
                      <th>{t('cert.issued')}</th>
                      <th>{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.certificates.map((c) => {
                      const holder = state.users.find((u) => u.id === c.userId)
                      const course = state.courses.find((x) => x.id === c.courseId)
                      return (
                        <tr key={c.id}>
                          <td><Link to={`/certificates/${c.code}`}>{c.code}</Link></td>
                          <td>{holder ? loc(holder, 'name') : ''}</td>
                          <td>{course ? loc(course, 'title') : ''}</td>
                          <td>{new Date(c.issuedAt).toLocaleDateString()}</td>
                          <td>
                            <select className="select" value={c.status} onChange={(e) => { setCertificateStatus(c.id, e.target.value); toast(t('common.success')) }}>
                              <option value="valid">{t('cert.valid')}</option>
                              <option value="revoked">{t('cert.revoked')}</option>
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}

            {tab === 'template' ? (
              <form
                className="card"
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.target)
                  updateCertificateTemplate(Object.fromEntries(fd.entries()))
                  toast(t('common.success'))
                }}
              >
                <div className="card-body">
                  <p className="muted small">قالب الشهادة — لا يتضمن أي اعتماد حكومي.</p>
                  {['typeAr', 'typeEn', 'leadAr', 'leadEn', 'completedAr', 'completedEn', 'signAr', 'signEn'].map((k) => (
                    <Field key={k} label={k}><input className="input" name={k} defaultValue={tpl[k] || ''} /></Field>
                  ))}
                  <Field label="disclaimerAr"><textarea className="textarea" name="disclaimerAr" defaultValue={tpl.disclaimerAr || ''} /></Field>
                  <Field label="disclaimerEn"><textarea className="textarea" name="disclaimerEn" defaultValue={tpl.disclaimerEn || ''} /></Field>
                  <Button type="submit">{t('common.save')}</Button>
                </div>
              </form>
            ) : null}

            {tab === 'verification' ? (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>{t('cert.id')}</th>
                      <th>{t('cert.result')}</th>
                      <th>{t('cert.issued')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(state.verificationLogs || []).map((v) => (
                      <tr key={v.id}>
                        <td>{v.code}</td>
                        <td>{v.result}</td>
                        <td>{new Date(v.at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {tab === 'articles' ? (
              <ArticlesAdmin articles={state.articles} t={t} loc={loc} onSave={(a) => { upsertArticle(a); toast(t('common.success')) }} onRemove={(id) => { removeArticle(id); toast(t('common.success')) }} />
            ) : null}

            {tab === 'homepage' ? (
              <form
                className="card"
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.target)
                  updateHomepage({
                    kicker: fd.get('kicker'),
                    kickerEn: fd.get('kickerEn'),
                    tagline: fd.get('tagline'),
                    taglineEn: fd.get('taglineEn'),
                    intro: fd.get('intro'),
                    introEn: fd.get('introEn'),
                    accreditationNote: fd.get('accreditationNote'),
                    accreditationNoteEn: fd.get('accreditationNoteEn'),
                  })
                  toast(t('common.success'))
                }}
              >
                <div className="card-body">
                  <Field label="Kicker AR"><input className="input" name="kicker" defaultValue={state.homepage.kicker} /></Field>
                  <Field label="Kicker EN"><input className="input" name="kickerEn" defaultValue={state.homepage.kickerEn} /></Field>
                  <Field label="Tagline AR"><input className="input" name="tagline" defaultValue={state.homepage.tagline} /></Field>
                  <Field label="Tagline EN"><input className="input" name="taglineEn" defaultValue={state.homepage.taglineEn} /></Field>
                  <Field label="Intro AR"><textarea className="textarea" name="intro" defaultValue={state.homepage.intro} /></Field>
                  <Field label="Intro EN"><textarea className="textarea" name="introEn" defaultValue={state.homepage.introEn} /></Field>
                  <Field label="Accreditation note AR"><textarea className="textarea" name="accreditationNote" defaultValue={state.homepage.accreditationNote} /></Field>
                  <Field label="Accreditation note EN"><textarea className="textarea" name="accreditationNoteEn" defaultValue={state.homepage.accreditationNoteEn} /></Field>
                  <Button type="submit">{t('common.save')}</Button>
                </div>
              </form>
            ) : null}

            {tab === 'branding' ? (
              <form
                className="card"
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.target)
                  updateSettings({
                    brandNameAr: fd.get('brandNameAr'),
                    brandNameEn: fd.get('brandNameEn'),
                    logo: fd.get('logo'),
                    contactEmail: fd.get('contactEmail'),
                    contactPhone: fd.get('contactPhone'),
                    address: fd.get('address'),
                    addressEn: fd.get('addressEn'),
                  })
                  toast(t('common.success'))
                }}
              >
                <div className="card-body">
                  <p className="small muted">الألوان تُعدَّل من src/config/brand.js و :root في index.css</p>
                  <Field label="اسم عربي"><input className="input" name="brandNameAr" defaultValue={state.settings.brandNameAr || 'مِداد'} /></Field>
                  <Field label="Name EN"><input className="input" name="brandNameEn" defaultValue={state.settings.brandNameEn || 'MEDAD'} /></Field>
                  <Field label="Logo path"><input className="input" name="logo" defaultValue={state.settings.logo || '/brand/logo-mark.png'} /></Field>
                  <Field label={t('common.email')}><input className="input" name="contactEmail" defaultValue={state.settings.contactEmail} /></Field>
                  <Field label={t('common.phone')}><input className="input" name="contactPhone" defaultValue={state.settings.contactPhone} /></Field>
                  <Field label="Address AR"><input className="input" name="address" defaultValue={state.settings.address} /></Field>
                  <Field label="Address EN"><input className="input" name="addressEn" defaultValue={state.settings.addressEn} /></Field>
                  <Button type="submit">{t('common.save')}</Button>
                </div>
              </form>
            ) : null}

            {tab === 'payments' ? (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t('common.name')}</th>
                      <th>{t('nav.courses')}</th>
                      <th>{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.payments.map((p) => {
                      const st = state.users.find((u) => u.id === p.userId)
                      const c = state.courses.find((x) => x.id === p.courseId)
                      return (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{st ? loc(st, 'name') : ''}</td>
                          <td>{c ? loc(c, 'title') : ''}</td>
                          <td>{p.status} · {p.amount} {p.currency}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <p className="small muted mt">{t('common.demoPay')}</p>
              </div>
            ) : null}

            {tab === 'settings' ? (
              <div className="card">
                <div className="card-body">
                  <label className="opt">
                    <input
                      type="checkbox"
                      checked={state.settings.accreditationEnabled}
                      onChange={(e) => updateSettings({ accreditationEnabled: e.target.checked })}
                    />
                    <span>{state.lang === 'en' ? 'Enable official accreditation display (off by default)' : 'تفعيل عرض اعتماد رسمي (متوقف افتراضيًا)'}</span>
                  </label>
                  <Field label={state.lang === 'en' ? 'Accreditation body (shown only if enabled)' : 'جهة الاعتماد (تظهر فقط عند التفعيل)'}>
                    <input className="input" value={state.settings.accreditationBody} onChange={(e) => updateSettings({ accreditationBody: e.target.value, accreditationBodyEn: e.target.value })} />
                  </Field>
                  <Button
                    variant="outline"
                    className="mt"
                    onClick={() => {
                      if (confirm(t('admin.reset'))) resetDemo()
                    }}
                  >
                    {t('admin.reset')}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}

function PeopleTable({ people, role, t, loc, onSave, onRemove }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  return (
    <div>
      <form
        className="gap mb"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name || !email) return
          onSave({
            role,
            name,
            nameEn: name,
            email,
            password: 'Medad@2026',
            title: role === 'instructor' ? 'مدرب' : 'متعلم',
            titleEn: role === 'instructor' ? 'Instructor' : 'Learner',
            phone: '',
            city: '',
            cityEn: '',
            bio: '',
            bioEn: '',
            avatar: null,
            specialty: null,
            createdAt: new Date().toISOString(),
          })
          setName(''); setEmail('')
        }}
      >
        <input className="input" placeholder={t('common.name')} value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder={t('common.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" size="sm">{t('common.add')}</Button>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>{t('common.name')}</th><th>{t('common.email')}</th><th></th></tr></thead>
          <tbody>
            {people.map((u) => (
              <tr key={u.id}>
                <td>{loc(u, 'name')}</td>
                <td>{u.email}</td>
                <td><Button size="sm" variant="outline" onClick={() => onRemove(u.id)}>{t('common.delete')}</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CoursesAdmin({ courses, instructors, categories, loc, t, onSave, onRemove }) {
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  return (
    <div>
      <Button size="sm" className="mb" onClick={() => { setOpen(!open); setEdit(null) }}>{t('common.add')}</Button>
      {(open || edit) ? (
        <CourseForm
          key={edit?.id || 'new'}
          initial={edit}
          instructors={instructors}
          categories={categories}
          loc={loc}
          t={t}
          onCancel={() => { setOpen(false); setEdit(null) }}
          onSave={(c) => { onSave(c); setOpen(false); setEdit(null) }}
        />
      ) : null}
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>{t('common.name')}</th><th>{t('common.instructor')}</th><th>{t('common.level')}</th><th></th></tr></thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{loc(c, 'title')}</td>
                <td>{instructors.find((i) => i.id === c.instructorId)?.name}</td>
                <td>{c.level}</td>
                <td className="gap">
                  <Button size="sm" variant="outline" onClick={() => { setEdit(c); setOpen(false) }}>{t('common.edit')}</Button>
                  <Button size="sm" variant="outline" onClick={() => onRemove(c.id)}>{t('common.delete')}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CourseForm({ initial, instructors, categories, loc, t, onSave, onCancel }) {
  return (
    <form
      className="card mb"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.target)
        const objectives = String(fd.get('objectives') || '').split('\n').map((x) => x.trim()).filter(Boolean)
        const requirements = String(fd.get('requirements') || '').split('\n').map((x) => x.trim()).filter(Boolean)
        onSave({
          ...(initial || {}),
          slug: initial?.slug || String(fd.get('titleEn') || fd.get('title')).toLowerCase().replace(/\s+/g, '-'),
          title: fd.get('title'),
          titleEn: fd.get('titleEn') || fd.get('title'),
          instructorId: fd.get('instructorId'),
          categoryId: fd.get('categoryId'),
          level: fd.get('level'),
          durationHours: Number(fd.get('durationHours')) || 10,
          image: fd.get('image') || '/images/hero-lab.jpg',
          featured: fd.get('featured') === 'on',
          certificateEligible: fd.get('certificateEligible') === 'on',
          price: Number(fd.get('price')) || 0,
          currency: 'USD',
          description: fd.get('description'),
          descriptionEn: fd.get('descriptionEn') || fd.get('description'),
          objectives,
          objectivesEn: objectives,
          requirements,
          requirementsEn: requirements,
        })
      }}
    >
      <div className="card-body">
        <Field label="العنوان"><input className="input" name="title" defaultValue={initial?.title} required /></Field>
        <Field label="Title"><input className="input" name="titleEn" defaultValue={initial?.titleEn} /></Field>
        <Field label={t('common.instructor')}>
          <select className="select" name="instructorId" defaultValue={initial?.instructorId}>
            {instructors.map((i) => <option key={i.id} value={i.id}>{loc(i, 'name')}</option>)}
          </select>
        </Field>
        <Field label={t('common.category')}>
          <select className="select" name="categoryId" defaultValue={initial?.categoryId}>
            {categories.map((c) => <option key={c.id} value={c.id}>{loc(c, 'name')}</option>)}
          </select>
        </Field>
        <Field label={t('common.level')}>
          <select className="select" name="level" defaultValue={initial?.level || 'beginner'}>
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
        </Field>
        <Field label={t('common.duration')}><input className="input" name="durationHours" type="number" defaultValue={initial?.durationHours || 12} /></Field>
        <Field label="Image"><input className="input" name="image" defaultValue={initial?.image} /></Field>
        <Field label="Price"><input className="input" name="price" type="number" defaultValue={initial?.price || 0} /></Field>
        <label className="opt"><input type="checkbox" name="featured" defaultChecked={initial?.featured} /><span>Featured</span></label>
        <label className="opt"><input type="checkbox" name="certificateEligible" defaultChecked={initial?.certificateEligible !== false} /><span>{t('courses.certificate')}</span></label>
        <Field label={t('courses.objectives')}><textarea className="textarea" name="objectives" defaultValue={(initial?.objectives || []).join('\n')} /></Field>
        <Field label={t('courses.requirements')}><textarea className="textarea" name="requirements" defaultValue={(initial?.requirements || []).join('\n')} /></Field>
        <Field label="وصف"><textarea className="textarea" name="description" defaultValue={initial?.description} /></Field>
        <Field label="Description"><textarea className="textarea" name="descriptionEn" defaultValue={initial?.descriptionEn} /></Field>
        <div className="gap">
          <Button type="submit">{t('common.save')}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        </div>
      </div>
    </form>
  )
}

function LessonsAdmin({ courses, loc, t, addLesson, updateLesson, removeLesson, toast }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || '')
  const course = courses.find((c) => c.id === courseId)
  return (
    <div>
      <Field label={t('nav.courses')}>
        <select className="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map((c) => <option key={c.id} value={c.id}>{loc(c, 'title')}</option>)}
        </select>
      </Field>
      {course ? (
        <>
          <form
            className="card mb"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              addLesson(course.id, {
                title: fd.get('title'),
                titleEn: fd.get('titleEn') || fd.get('title'),
                content: fd.get('content'),
                contentEn: fd.get('content'),
                durationMin: Number(fd.get('durationMin')) || 20,
                type: fd.get('type') || 'reading',
              })
              toast(t('common.success'))
              e.target.reset()
            }}
          >
            <div className="card-body">
              <Field label=""><input className="input" name="title" placeholder={t('common.lesson')} required /></Field>
              <Field label=""><select className="select" name="type"><option value="reading">reading</option><option value="lab">lab</option><option value="video">video</option></select></Field>
              <Field label=""><input className="input" name="durationMin" type="number" defaultValue={20} /></Field>
              <Field label=""><textarea className="textarea" name="content" /></Field>
              <Button type="submit" size="sm">{t('common.add')}</Button>
            </div>
          </form>
          {course.lessons.map((l) => (
            <div className="lesson-item" key={l.id}>
              <div className="lesson-num">{l.order}</div>
              <div style={{ flex: 1 }}>
                <input className="input" defaultValue={l.title} onBlur={(e) => { updateLesson(course.id, l.id, { title: e.target.value, titleEn: e.target.value }); toast(t('common.success')) }} />
              </div>
              <Button size="sm" variant="outline" onClick={() => { removeLesson(course.id, l.id); toast(t('common.success')) }}>{t('common.delete')}</Button>
            </div>
          ))}
        </>
      ) : null}
    </div>
  )
}

function ExamsAdmin({ exams, courses, loc, t, upsertExam, toast }) {
  return (
    <div>
      <form
        className="card mb"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.target)
          upsertExam({
            courseId: fd.get('courseId'),
            title: fd.get('title'),
            titleEn: fd.get('title'),
            passingScore: Number(fd.get('passingScore')) || 70,
            timeLimitMin: Number(fd.get('timeLimitMin')) || 20,
            questions: [],
          })
          toast(t('common.success'))
          e.target.reset()
        }}
      >
        <div className="card-body">
          <Field label="">
            <select className="select" name="courseId">
              {courses.map((c) => <option key={c.id} value={c.id}>{loc(c, 'title')}</option>)}
            </select>
          </Field>
          <Field label=""><input className="input" name="title" placeholder={t('exam.title')} required /></Field>
          <Field label="Passing %"><input className="input" name="passingScore" type="number" defaultValue={70} /></Field>
          <Field label="Minutes"><input className="input" name="timeLimitMin" type="number" defaultValue={20} /></Field>
          <Button type="submit" size="sm">{t('common.add')}</Button>
        </div>
      </form>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>{t('common.name')}</th><th>{t('nav.courses')}</th><th></th></tr></thead>
          <tbody>
            {exams.map((ex) => {
              const c = courses.find((x) => x.id === ex.courseId)
              return (
                <tr key={ex.id}>
                  <td>{loc(ex, 'title')}</td>
                  <td>{c ? loc(c, 'title') : ''}</td>
                  <td>
                    <input
                      className="input"
                      style={{ width: 80 }}
                      type="number"
                      defaultValue={ex.passingScore}
                      onBlur={(e) => { upsertExam({ ...ex, passingScore: Number(e.target.value) }); toast(t('common.success')) }}
                    />
                    {' '}% · {ex.questions.length}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function QuestionsAdmin({ exams, courses, loc, t, addQuestion, updateQuestion, removeQuestion, toast }) {
  const [examId, setExamId] = useState(exams[0]?.id || '')
  const exam = exams.find((e) => e.id === examId)
  return (
    <div>
      <Field label={t('admin.exams')}>
        <select className="select" value={examId} onChange={(e) => setExamId(e.target.value)}>
          {exams.map((ex) => {
            const c = courses.find((x) => x.id === ex.courseId)
            return <option key={ex.id} value={ex.id}>{loc(ex, 'title')} — {c ? loc(c, 'title') : ''}</option>
          })}
        </select>
      </Field>
      {exam ? (
        <>
          <form
            className="card mb"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              const options = [fd.get('o0'), fd.get('o1'), fd.get('o2'), fd.get('o3')].map(String)
              addQuestion(exam.id, {
                text: fd.get('text'),
                textEn: fd.get('text'),
                options,
                optionsEn: options,
                correctIndex: Number(fd.get('correctIndex')) || 0,
              })
              toast(t('common.success'))
              e.target.reset()
            }}
          >
            <div className="card-body">
              <Field label=""><input className="input" name="text" placeholder="السؤال" required /></Field>
              {[0, 1, 2, 3].map((i) => <Field key={i} label=""><input className="input" name={`o${i}`} placeholder={`خيار ${i + 1}`} required={i < 2} /></Field>)}
              <Field label="الإجابة الصحيحة (0–3)"><input className="input" name="correctIndex" type="number" defaultValue={0} min={0} max={3} /></Field>
              <Button type="submit" size="sm">{t('common.add')}</Button>
            </div>
          </form>
          {exam.questions.map((q, i) => (
            <div className="q-item" key={q.id}>
              <strong>{i + 1}. {loc(q, 'text')}</strong>
              <p className="small muted">{(q.options || []).join(' · ')} → {q.correctIndex}</p>
              <Button size="sm" variant="outline" onClick={() => { removeQuestion(exam.id, q.id); toast(t('common.success')) }}>{t('common.delete')}</Button>
            </div>
          ))}
        </>
      ) : null}
    </div>
  )
}

function PathsAdmin({ paths, courses, loc, t, onSave, onRemove, toast }) {
  return (
    <div>
      <form
        className="card mb"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.target)
          const courseIds = fd.getAll('courseIds')
          onSave({
            title: fd.get('title'),
            titleEn: fd.get('titleEn') || fd.get('title'),
            description: fd.get('description'),
            descriptionEn: fd.get('description'),
            level: fd.get('level') || 'professional',
            durationHours: Number(fd.get('durationHours')) || 0,
            courseIds,
            outcomes: String(fd.get('outcomes') || '').split('\n').filter(Boolean),
            outcomesEn: String(fd.get('outcomes') || '').split('\n').filter(Boolean),
            image: '/images/hero-lab.jpg',
          })
          toast(t('common.success'))
          e.target.reset()
        }}
      >
        <div className="card-body">
          <Field label=""><input className="input" name="title" placeholder="عنوان المسار" required /></Field>
          <Field label=""><textarea className="textarea" name="description" /></Field>
          <Field label={t('nav.courses')}>
            <select className="select" name="courseIds" multiple style={{ height: 120 }}>
              {courses.map((c) => <option key={c.id} value={c.id}>{loc(c, 'title')}</option>)}
            </select>
          </Field>
          <Field label=""><textarea className="textarea" name="outcomes" placeholder="نواتج — سطر لكل بند" /></Field>
          <Button type="submit" size="sm">{t('common.add')}</Button>
        </div>
      </form>
      {paths.map((p) => (
        <div className="split mb" key={p.id}>
          <span>{loc(p, 'title')} · {p.courseIds.length}</span>
          <Button size="sm" variant="outline" onClick={() => { onRemove(p.id); toast(t('common.success')) }}>{t('common.delete')}</Button>
        </div>
      ))}
    </div>
  )
}

function ArticlesAdmin({ articles, t, loc, onSave, onRemove }) {
  return (
    <div>
      <form
        className="card mb"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.target)
          onSave({
            slug: String(fd.get('title')).slice(0, 24).replace(/\s+/g, '-'),
            title: fd.get('title'),
            titleEn: fd.get('title'),
            category: 'quality',
            authorId: 'u-admin',
            readMin: 5,
            image: '/images/hero-lab.jpg',
            excerpt: fd.get('excerpt'),
            excerptEn: fd.get('excerpt'),
            content: fd.get('excerpt'),
            contentEn: fd.get('excerpt'),
          })
          e.target.reset()
        }}
      >
        <div className="card-body">
          <Field label=""><input className="input" name="title" placeholder={t('common.name')} required /></Field>
          <Field label=""><textarea className="textarea" name="excerpt" /></Field>
          <Button type="submit" size="sm">{t('common.add')}</Button>
        </div>
      </form>
      {articles.map((a) => (
        <div className="split mb" key={a.id}>
          <span>{loc(a, 'title')}</span>
          <Button size="sm" variant="outline" onClick={() => onRemove(a.id)}>{t('common.delete')}</Button>
        </div>
      ))}
    </div>
  )
}
