import { useMemo, useState } from 'react'
import { useApp } from '../store/AppStore'
import CourseCard from '../components/CourseCard'
import { Empty } from '../components/UI'

export default function Courses() {
  const { state, t, loc, userById } = useApp()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [level, setLevel] = useState('all')

  const list = useMemo(() => {
    const query = q.trim().toLowerCase()
    return state.courses.filter((c) => {
      if (cat !== 'all' && c.categoryId !== cat) return false
      if (level !== 'all' && c.level !== level) return false
      if (!query) return true
      const inst = userById(c.instructorId)
      const blob = `${c.title} ${c.titleEn} ${c.description} ${inst?.name || ''}`.toLowerCase()
      return blob.includes(query)
    })
  }, [state.courses, q, cat, level, userById])

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('courses.title')}</h1>
          <p>{t('courses.subtitle')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="split mb">
            <input className="input" style={{ maxWidth: 360 }} placeholder={t('courses.searchPh')} value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="chips">
              <button className={`chip ${cat === 'all' ? 'on' : ''}`} type="button" onClick={() => setCat('all')}>{t('common.all')}</button>
              {state.categories.map((c) => (
                <button key={c.id} className={`chip ${cat === c.id ? 'on' : ''}`} type="button" onClick={() => setCat(c.id)}>{loc(c, 'name')}</button>
              ))}
            </div>
          </div>
          <div className="chips mb">
            {['all', 'beginner', 'intermediate'].map((lv) => (
              <button key={lv} className={`chip ${level === lv ? 'on' : ''}`} type="button" onClick={() => setLevel(lv)}>
                {lv === 'all' ? t('common.level') + ': ' + t('common.all') : t(`common.${lv}`)}
              </button>
            ))}
          </div>
          {list.length === 0 ? (
            <Empty title={t('courses.noResults')} />
          ) : (
            <div className="grid-3">
              {list.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
