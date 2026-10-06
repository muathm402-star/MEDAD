import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import CourseCard from '../components/CourseCard'
import { Avatar, Button } from '../components/UI'

const benefits = [
  { ar: 'محتوى سريري متخصص', en: 'Specialist clinical content', dAr: 'دورات مبنية على ممارسة المختبر الطبي لا على عمومية أكاديمية فضفاضة.', dEn: 'Courses built around medical-laboratory practice, not generic academia.' },
  { ar: 'تقييم معياري', en: 'Criterion assessment', dAr: 'اختبار مرتبط بكل دورة ودرجة نجاح واضحة قبل إصدار أي شهادة.', dEn: 'A course-linked exam and a clear passing score before any certificate is issued.' },
  { ar: 'شهادة قابلة للتحقق', en: 'Verifiable certificate', dAr: 'رقم فريد ورمز استجابة سريعة يثبت صدور شهادة الإتمام إلكترونيًا.', dEn: 'A unique ID and QR code prove electronic issuance of the completion certificate.' },
  { ar: 'مسارات مهنية', en: 'Professional paths', dAr: 'تسلسل من السلامة وجمع العينة إلى التحليل ثم الجودة.', dEn: 'A sequence from safety and collection to analytics and then quality.' },
  { ar: 'لوحة تقدّم', en: 'Progress dashboard', dAr: 'متابعة الدروس والاختبارات والشهادات من حساب واحد.', dEn: 'Track lessons, exams and certificates from a single account.' },
  { ar: 'جاهزية للاعتماد لاحقًا', en: 'Ready for future accreditation', dAr: 'البنية تسمح بشراكات رسمية دون ادّعاء اعتماد قائم اليوم.', dEn: 'The architecture can host official partnerships without claiming accreditation today.' },
]

export default function Home() {
  const { state, t, loc, instructors } = useApp()
  const featured = state.courses.filter((c) => c.featured)
  const faculty = instructors()
  const statsLearners = state.users.filter((u) => u.role === 'student').length + 1400
  const hp = state.homepage

  return (
    <>
      <section className="hero">
        <img className="hero-bg" src="/images/hero-lab.jpg" alt="" />
        <div className="hero-content">
          <div className="kicker">{loc(hp, 'kicker')}</div>
          <h1>{hp.headline}</h1>
          <div className="tagline">{loc(hp, 'tagline')}</div>
          <p className="lead">{loc(hp, 'intro')}</p>
          <div className="hero-ctas">
            <Link to="/courses"><Button variant="gold">{t('hero.ctaCourses')}</Button></Link>
            <Link to="/verify"><Button variant="ghost">{t('hero.ctaVerify')}</Button></Link>
          </div>
          <div className="trust-row">
            <span><i className="dot-gold" /> {t('cert.verifiable')}</span>
            <span><i className="dot-gold" /> {t('nav.paths')}</span>
            <span><i className="dot-gold" /> {t('footer.independent')}</span>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="stats">
          <div className="stat"><b>{statsLearners.toLocaleString()}+</b><span>{t('home.statsLearners')}</span></div>
          <div className="stat"><b>{state.courses.length}</b><span>{t('home.statsCourses')}</span></div>
          <div className="stat"><b>{faculty.length}</b><span>{t('home.statsInstructors')}</span></div>
          <div className="stat"><b>{state.certificates.length + 180}</b><span>{t('home.statsCertificates')}</span></div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">{t('brand')}</div>
              <h2>{t('home.featured')}</h2>
              <p>{t('home.featuredSub')}</p>
            </div>
            <Link to="/courses"><Button variant="outline">{t('nav.courses')}</Button></Link>
          </div>
          <div className="grid-3">
            {featured.slice(0, 6).map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--ivory-100)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">{t('home.paths')}</div>
              <h2>{t('home.paths')}</h2>
              <p>{t('home.pathsSub')}</p>
            </div>
          </div>
          <div className="grid-3">
            {state.paths.map((p) => (
              <Link key={p.id} to={`/paths/${p.slug}`} className="card">
                <div className="card-media"><img src={p.image} alt="" /></div>
                <div className="card-body">
                  <h3>{loc(p, 'title')}</h3>
                  <p className="muted">{loc(p, 'description').slice(0, 140)}…</p>
                  <div className="card-foot">
                    <span>{p.courseIds.length} {t('nav.courses')}</span>
                    <span>{p.durationHours} {t('common.hours')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">{t('home.benefits')}</div>
              <h2>{t('home.benefits')}</h2>
            </div>
          </div>
          <div className="grid-3">
            {benefits.map((b) => (
              <div className="benefit" key={b.ar}>
                <div className="ico">✦</div>
                <h3>{state.lang === 'en' ? b.en : b.ar}</h3>
                <p>{state.lang === 'en' ? b.dEn : b.dAr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--navy-900)', color: '#f7f4ef' }}>
        <div className="container grid-2" style={{ alignItems: 'center' }}>
          <div>
            <div className="kicker">{t('cert.type')}</div>
            <h2 style={{ color: '#fbf9f4' }}>{t('home.certificates')}</h2>
            <p style={{ color: 'rgba(247,244,239,.8)' }}>{t('home.certBody')}</p>
            <div className="gap mt">
              <Link to="/verify"><Button variant="gold">{t('hero.ctaVerify')}</Button></Link>
              <Link to="/certificates"><Button variant="ghost">{t('nav.certificates')}</Button></Link>
            </div>
          </div>
          <div className="card" style={{ background: 'var(--ivory-50)', color: 'var(--ink)' }}>
            <div className="card-body">
              <div className="split">
                <strong>{t('cert.demoHint')}</strong>
                <span className="badge badge-ok">{t('cert.valid')}</span>
              </div>
              <p>{state.lang === 'en' ? 'Sample issued certificate' : 'نموذج شهادة صادرة'}: <b>MD-2026-7F3K91</b></p>
              <p className="small muted">{state.lang === 'en' ? 'Fatima Al-Zubaidi — Infection control' : 'فاطمة الزبيدي — مكافحة العدوى وسلامة العاملين الصحيين'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">{t('home.instructors')}</div>
              <h2>{t('home.instructors')}</h2>
            </div>
            <Link to="/instructors"><Button variant="outline">{t('nav.instructors')}</Button></Link>
          </div>
          <div className="grid-3">
            {faculty.map((u) => (
              <Link key={u.id} to={`/instructors/${u.id}`} className="card">
                <div className="card-body gap">
                  <Avatar user={u} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>{loc(u, 'name')}</h3>
                    <p className="muted" style={{ margin: 0 }}>{loc(u, 'title')}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--ivory-100)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">{t('home.articles')}</div>
              <h2>{t('home.articles')}</h2>
            </div>
            <Link to="/articles"><Button variant="outline">{t('nav.articles')}</Button></Link>
          </div>
          <div className="grid-3">
            {state.articles.slice(0, 3).map((a) => (
              <Link key={a.id} to={`/articles/${a.slug}`} className="card">
                <div className="card-media"><img src={a.image} alt="" /></div>
                <div className="card-body">
                  <h3>{loc(a, 'title')}</h3>
                  <p className="muted">{loc(a, 'excerpt')}</p>
                  <span className="small muted">{a.readMin} {state.lang === 'en' ? 'min' : 'دقيقة'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'linear-gradient(180deg, var(--navy-900), var(--navy-950))', color: '#f7f4ef' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fbf9f4', fontSize: 36 }}>{t('home.finalCta')}</h2>
          <p style={{ color: 'rgba(247,244,239,.8)' }}>{t('home.finalCtaSub')}</p>
          <div className="gap" style={{ justifyContent: 'center' }}>
            <Link to="/register"><Button variant="gold">{t('home.start')}</Button></Link>
            <Link to="/courses"><Button variant="ghost">{t('hero.ctaCourses')}</Button></Link>
          </div>
        </div>
      </section>
    </>
  )
}
