import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useApp } from '../store/AppStore'

/** Printable certificate. Wording comes from state.certificateTemplate (Admin → Template). */
export default function CertificateView({ certificate }) {
  const { userById, courseById, loc, t, state } = useApp()
  const holder = userById(certificate.userId)
  const course = courseById(certificate.courseId)
  const instructor = userById(certificate.instructorId)
  const tpl = state.certificateTemplate || {}
  const [qr, setQr] = useState('')
  const verifyUrl = `${window.location.origin}/verify/${certificate.code}`

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 180, color: { dark: '#0b1f3a', light: '#ffffff' } }).then(setQr)
  }, [verifyUrl])

  const date = new Date(certificate.issuedAt).toLocaleDateString(state.lang === 'en' ? 'en-GB' : 'ar-YE', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const en = state.lang === 'en'

  return (
    <div className="certificate" id="certificate-print">
      <div className="watermark">{state.settings.brandNameAr || 'مِداد'}</div>
      <div className="certificate-inner">
        <div className="cert-top">
          <img className="cert-seal" src={state.settings.logo || '/brand/logo-mark.png'} alt="MEDAD" />
          <div className="cert-brand">
            <div className="ar">{state.settings.brandNameAr || 'مِداد'}</div>
            <div className="en">{state.settings.brandNameEn || 'MEDAD'}</div>
          </div>
          <div className="small" style={{ textAlign: 'end', color: '#5c6b7a' }}>
            {t('cert.verifiable')}
            <div>{certificate.code}</div>
          </div>
        </div>
        <div className="cert-type">{(en ? tpl.typeEn : tpl.typeAr) || t('cert.type')}</div>
        <div className="cert-center">
          <div className="muted">{en ? tpl.leadEn : tpl.leadAr}</div>
          <div className="cert-name">{holder ? loc(holder, 'name') : '—'}</div>
          <div className="muted">{en ? tpl.completedEn : tpl.completedAr}</div>
          <div className="cert-course">{course ? loc(course, 'title') : '—'}</div>
          <p className="small muted" style={{ maxWidth: 560 }}>{en ? tpl.disclaimerEn : tpl.disclaimerAr}</p>
          {state.settings.accreditationEnabled && state.settings.accreditationBody ? (
            <p className="small">{en ? state.settings.accreditationBodyEn : state.settings.accreditationBody}</p>
          ) : null}
        </div>
        <div className="cert-bottom">
          <div>
            <div className="sign-line">
              {instructor ? loc(instructor, 'name') : '—'}
              <div className="muted">{t('common.instructor')}</div>
            </div>
          </div>
          <div className="qr-box">
            {qr ? <img src={qr} alt="QR" /> : <div className="spinner" />}
            <span className="muted">{certificate.code}</span>
          </div>
          <div>
            <div className="sign-line">
              {en ? tpl.signEn : tpl.signAr}
              <div className="muted">{date}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
