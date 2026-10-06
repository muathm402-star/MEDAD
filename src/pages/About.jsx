import { Link } from 'react-router-dom'
import { useApp } from '../store/AppStore'
import { Button } from '../components/UI'

export default function About() {
  const { t, state } = useApp()
  const ar = state.lang !== 'en'
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('about.title')}</h1>
          <p>{t('tagline')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container prose">
          {ar ? (
            <>
              <p>
                مِداد منصة تعليم وتدريب مهني صحي، تنطلق من احتياجات المختبرات الطبية والعاملين في الخطوط الأمامية: جمع صحيح للعينة، تحليل موثوق، وجودة لا تتوقف عند الورق، وسلامة لا تُختزل في شعار.
              </p>
              <p>
                الاسم مستمد من المداد: الحبر الذي يُكتب به العلم ويُوثَّق به الإنجاز. نبني محتوى تطبيقيًا، وتقييمات واضحة، وشهادات إتمام قابلة للتحقق إلكترونيًا حتى يمكن لصاحب العمل أو الجهة المستقبلة أن يتأكد من صدور الشهادة.
              </p>
              <h2>ماذا نعد به، وما لا ندّعيه</h2>
              <p>
                نعد بمنهج مهني، وتتبع للتقدم، وتصميم جاهز للارتباط لاحقًا بشراكات اعتماد رسمية. لا ندّعي اليوم اعتمادًا من أي وزارة أو هيئة. إن أُبرمت شراكة مستقبلية فستُعلن صراحة من إعدادات المنصة، لا بالتلميح في الشهادات.
              </p>
              <h2>لمن المنصة</h2>
              <p>
                فنيو المختبرات، وطلاب العلوم الطبية التطبيقية، والعاملون الصحيون الذين يحتاجون توثيقًا داخليًا لكفايات السلامة وجمع العينات والجودة.
              </p>
            </>
          ) : (
            <>
              <p>
                MEDAD is a professional healthcare education platform, starting from the real needs of medical laboratories and frontline staff: correct collection, reliable analysis, quality that is more than paperwork, and safety that is more than a slogan.
              </p>
              <p>
                The name comes from midād — ink — the medium of knowledge and of documented achievement. We build applied content, clear assessments, and electronically verifiable completion certificates so an employer can confirm issuance.
              </p>
              <h2>What we promise, and what we do not claim</h2>
              <p>
                We promise a professional curriculum, progress tracking, and an architecture ready for future official accreditation partnerships. We do not currently claim accreditation by any ministry or authority. If a partnership is signed, it will be stated explicitly in platform settings, not implied on certificates.
              </p>
              <h2>Who it is for</h2>
              <p>
                Laboratory technicians, applied medical sciences students, and healthcare workers who need internal documentation of safety, specimen handling and quality competencies.
              </p>
            </>
          )}
          <div className="gap mt">
            <Link to="/courses"><Button>{t('hero.ctaCourses')}</Button></Link>
            <Link to="/contact"><Button variant="outline">{t('nav.contact')}</Button></Link>
          </div>
        </div>
      </section>
    </>
  )
}
