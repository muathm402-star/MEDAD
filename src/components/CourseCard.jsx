import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Badge, LevelBadge, Stars } from './UI'

export default function CourseCard({ course }) {
  const { loc, userById, categoryById, t } = useApp()
  const inst = userById(course.instructorId)
  const cat = categoryById(course.categoryId)
  return (
    <Link to={`/courses/${course.slug}`} className="card">
      <div className="card-media">
        <img src={course.image} alt="" />
      </div>
      <div className="card-body">
        <div className="card-meta">
          <Badge tone="blue">{loc(cat || {}, 'name') || course.categoryId}</Badge>
          <LevelBadge level={course.level} t={t} />
          {course.price === 0 ? <Badge tone="ok">{t('common.free')}</Badge> : <Badge tone="gold">${course.price}</Badge>}
        </div>
        <h3>{loc(course, 'title')}</h3>
        <p className="muted">{loc(course, 'description').slice(0, 110)}…</p>
        <div className="card-foot">
          <span>{inst ? loc(inst, 'name') : ''}</span>
          <Stars value={course.rating} />
        </div>
        <div className="card-foot mt">
          <span>{course.durationHours} {t('common.hours')}</span>
          <span>{course.lessons.length} {t('common.lessons')}</span>
        </div>
      </div>
    </Link>
  )
}
