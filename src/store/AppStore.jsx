/**
 * MEDAD application store
 * -----------------------
 * UI talks only to this module (useApp). Persistence is localStorage today.
 * To connect a backend later: replace loadState / patch with API calls that
 * keep the same method names and payload shapes.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createInitialState, SEED_VERSION } from '../data/seed'
import { dictionaries } from '../i18n'
import { STORAGE_KEY } from '../config/platform'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

export function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function certCode() {
  const year = new Date().getFullYear()
  const body = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  return `MD-${year}-${body.padEnd(6, 'X')}`
}

function mergeV3(parsed, fresh) {
  const avatars = Object.fromEntries(fresh.users.map((u) => [u.id, u.avatar]))
  return {
    ...fresh,
    users: (parsed.users || fresh.users).map((u) => ({
      ...u,
      avatar: avatars[u.id] ?? u.avatar,
    })),
    courses: parsed.courses || fresh.courses,
    exams: parsed.exams || fresh.exams,
    paths: parsed.paths || fresh.paths,
    articles: parsed.articles || fresh.articles,
    categories: parsed.categories || fresh.categories,
    enrollments: parsed.enrollments || fresh.enrollments,
    certificates: parsed.certificates || fresh.certificates,
    payments: parsed.payments || fresh.payments,
    homepage: { ...fresh.homepage, ...(parsed.homepage || {}) },
    settings: { ...fresh.settings, ...(parsed.settings || {}) },
    certificateTemplate: { ...fresh.certificateTemplate, ...(parsed.certificateTemplate || {}) },
    notifications: parsed.notifications || fresh.notifications,
    verificationLogs: parsed.verificationLogs || fresh.verificationLogs,
    sessionUserId: parsed.sessionUserId || null,
    lang: parsed.lang || 'ar',
    seedVersion: SEED_VERSION,
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw)
    const fresh = createInitialState()
    return mergeV3(parsed, fresh)
  } catch {
    return createInitialState()
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadState())
  const [hydrated, setHydrated] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  useEffect(() => {
    const dict = dictionaries[state.lang] || dictionaries.ar
    document.documentElement.lang = dict.locale
    document.documentElement.dir = dict.dir
  }, [state.lang])

  const toast = useCallback((message, type = 'success') => {
    const id = uid('toast')
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])

  const patch = useCallback((fn) => setState((s) => fn(s)), [])
useEffect(() => {
  let mounted = true

  supabase.auth.getSession().then(async ({ data }) => {
    if (!mounted || !data.session?.user) return

    const authUser = data.session.user

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', authUser.id)
      .single()

    if (!mounted || !profile) return

    patch((s) => ({
      ...s,
      users: [
        ...s.users.filter((u) => u.id !== authUser.id),
        {
          id: authUser.id,
          role: profile.role || 'student',
          name: profile.full_name || authUser.email || '',
          email: authUser.email || '',
        },
      ],
      sessionUserId: authUser.id,
    }))
  })

  return () => {
    mounted = false
  }
}, [patch])
  const user = useMemo(
    () => state.users.find((u) => u.id === state.sessionUserId) || null,
    [state.users, state.sessionUserId],
  )

  const api = useMemo(() => {
    const loc = (obj, key) => (state.lang === 'en' && obj[`${key}En`] ? obj[`${key}En`] : obj[key])
    const courseById = (id) => state.courses.find((c) => c.id === id)
    const userById = (id) => state.users.find((u) => u.id === id)
    const enrollment = (userId, courseId) =>
      state.enrollments.find((e) => e.userId === userId && e.courseId === courseId)

    const progressOf = (en) => {
      if (!en) return 0
      const course = courseById(en.courseId)
      if (!course?.lessons?.length) return en.examPassed ? 100 : 0
      const lessonPct = (en.completedLessonIds.length / course.lessons.length) * 90
      return Math.round(Math.min(100, lessonPct + (en.examPassed ? 10 : 0)))
    }

    const lessonsComplete = (en) => {
      if (!en) return false
      const course = courseById(en.courseId)
      return course && en.completedLessonIds.length >= course.lessons.length
    }

    const pathProgress = (userId, path) => {
      const list = (path.courseIds || []).map((id) => courseById(id)).filter(Boolean)
      if (!list.length) return { pct: 0, done: 0, remaining: 0, total: 0 }
      const scores = list.map((c) => progressOf(enrollment(userId, c.id)))
      const done = scores.filter((p) => p >= 100).length
      return {
        pct: Math.round(scores.reduce((a, b) => a + b, 0) / list.length),
        done,
        remaining: list.length - done,
        total: list.length,
      }
    }

    const pushNote = (s, note) => ({
      ...s,
      notifications: [{ id: uid('n'), at: new Date().toISOString(), read: false, ...note }, ...(s.notifications || [])],
    })

    return {
      loc,
      courseById,
      userById,
      enrollment,
      progressOf,
      lessonsComplete,
      pathProgress,
      categoryById: (id) => state.categories.find((c) => c.id === id),
      examByCourse: (courseId) => state.exams.find((e) => e.courseId === courseId),
      instructors: () => state.users.filter((u) => u.role === 'instructor'),
      students: () => state.users.filter((u) => u.role === 'student'),
      certificatesOf: (userId) => state.certificates.filter((c) => c.userId === userId),
      enrollmentsOf: (userId) => state.enrollments.filter((e) => e.userId === userId),
      notificationsOf: (userId) => (state.notifications || []).filter((n) => n.userId === userId),
      findCertificate: (code) =>
        state.certificates.find((c) => c.code.toUpperCase() === String(code || '').trim().toUpperCase()),

      setLang: (lang) => patch((s) => ({ ...s, lang })),

      login: async (email, password) => {
        let data, error
        try {
          const result = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          })
          data = result.data
          error = result.error
        } catch (e) {
          return {
            ok: false,
            error: e?.message || 'حدث خطأ أثناء الاتصال بـ Supabase',
          }
        }

        if (error || !data.user) {
          console.error('MEDAD Supabase login error:', error)
          return { ok: false, error: error?.message || 'Login failed' }
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile) {
          console.error('MEDAD profile error:', profileError)
          await supabase.auth.signOut()
          return {
            ok: false,
            error: profileError?.message || 'Profile not found'
          }
        }

        const mappedUser = {
          id: data.user.id,
          role: profile.role || 'student',
          name: profile.full_name || data.user.email || '',
          email: data.user.email || '',
        }

        patch((s) => ({
          ...s,
          users: [
            ...s.users.filter((u) => u.id !== mappedUser.id),
            { ...(s.users.find((u) => u.id === mappedUser.id) || {}), ...mappedUser },
          ],
          sessionUserId: mappedUser.id,
        }))

        return { ok: true, user: mappedUser }
      },
logout: async () => {
  await supabase.auth.signOut()
  patch((s) => ({ ...s, sessionUserId: null }))
},      register: async ({ name, email, password, phone, city }) => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
       })

        if (error || !data.user) {
          return {
            ok: false,
            error: error?.message || (state.lang === 'en'
              ? 'Registration failed.'
              : 'فشل إنشاء الحساب.'),
          }
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile) {
          return {
            ok: false,
            error: state.lang === 'en'
              ? 'Account created, but profile setup failed.'
              : 'تم إنشاء الحساب، لكن تعذر إعداد الملف الشخصي.',
          }
        }

        const nu = {
          id: data.user.id,
          role: profile.role || 'student',
          name: profile.full_name || name.trim(),
          nameEn: profile.full_name || name.trim(),
          email: data.user.email || email.trim().toLowerCase(),
          title: state.lang === 'en' ? 'Learner' : 'متعلم',
          titleEn: 'Learner',
          phone: phone || '',
          city: city || '',
          cityEn: city || '',
          bio: '',
          bioEn: '',
          avatar: null,
          specialty: null,
          createdAt: new Date().toISOString(),
        }

        patch((s) => ({
          ...s,
          users: [...s.users.filter((u) => u.id !== nu.id), nu],
          sessionUserId: data.session?.user?.id || null,
        }))

        return {
          ok: true,
          user: nu,
          needsConfirmation: !data.session,
        }
      },

      updateProfile: (userId, fields) => {
        patch((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === userId ? { ...u, ...fields } : u)),
        }))
      },

      enroll: (userId, courseId) => {
        if (enrollment(userId, courseId)) return { ok: true, already: true }
        const course = courseById(courseId)
        const rec = {
          id: uid('en'),
          userId,
          courseId,
          completedLessonIds: [],
          examAttempts: [],
          examPassed: false,
          certificateId: null,
          enrolledAt: new Date().toISOString(),
          completedAt: null,
        }
        const pay = {
          id: uid('pay'),
          userId,
          courseId,
          amount: course?.price || 0,
          currency: course?.currency || 'USD',
          status: !course?.price ? 'waived' : 'demo-paid',
          method: 'demo',
          createdAt: new Date().toISOString(),
        }
        patch((s) => pushNote({
          ...s,
          enrollments: [...s.enrollments, rec],
          payments: [...s.payments, pay],
          courses: s.courses.map((c) =>
            c.id === courseId ? { ...c, enrolledCount: (c.enrolledCount || 0) + 1 } : c,
          ),
        }, {
          userId,
          title: 'تم الالتحاق بدورة',
          titleEn: 'Course enrollment',
          body: course ? course.title : courseId,
          bodyEn: course ? course.titleEn || course.title : courseId,
          href: course ? `/courses/${course.slug}` : '/courses',
        }))
        return { ok: true }
      },

      enrollPath: (userId, pathId) => {
        const path = state.paths.find((p) => p.id === pathId)
        if (!path) return { ok: false }
        patch((s) => {
          let enrollments = [...s.enrollments]
          let payments = [...s.payments]
          let courses = s.courses
          path.courseIds.forEach((courseId) => {
            if (enrollments.some((e) => e.userId === userId && e.courseId === courseId)) return
            const course = courses.find((c) => c.id === courseId)
            enrollments.push({
              id: uid('en'),
              userId,
              courseId,
              completedLessonIds: [],
              examAttempts: [],
              examPassed: false,
              certificateId: null,
              enrolledAt: new Date().toISOString(),
              completedAt: null,
            })
            payments.push({
              id: uid('pay'),
              userId,
              courseId,
              amount: course?.price || 0,
              currency: course?.currency || 'USD',
              status: !course?.price ? 'waived' : 'demo-paid',
              method: 'demo',
              createdAt: new Date().toISOString(),
            })
            courses = courses.map((c) =>
              c.id === courseId ? { ...c, enrolledCount: (c.enrolledCount || 0) + 1 } : c,
            )
          })
          return pushNote({ ...s, enrollments, payments, courses }, {
            userId,
            title: 'التحاق بمسار مهني',
            titleEn: 'Path enrollment',
            body: path.title,
            bodyEn: path.titleEn || path.title,
            href: `/paths/${path.slug}`,
          })
        })
        return { ok: true }
      },

      completeLesson: (userId, courseId, lessonId) => {
        patch((s) => {
          const next = {
            ...s,
            enrollments: s.enrollments.map((e) => {
              if (e.userId !== userId || e.courseId !== courseId) return e
              if (e.completedLessonIds.includes(lessonId)) return e
              return { ...e, completedLessonIds: [...e.completedLessonIds, lessonId] }
            }),
          }
          const en = next.enrollments.find((e) => e.userId === userId && e.courseId === courseId)
          const course = next.courses.find((c) => c.id === courseId)
          if (course && en && en.completedLessonIds.length >= course.lessons.length) {
            return pushNote(next, {
              userId,
              title: 'جاهز للتقييم',
              titleEn: 'Assessment unlocked',
              body: course.title,
              bodyEn: course.titleEn || course.title,
              href: `/exams/${courseId}`,
            })
          }
          return next
        })
      },

      submitExam: (userId, courseId, answers) => {
        const exam = state.exams.find((e) => e.courseId === courseId)
        if (!exam) return { ok: false }
        let correct = 0
        exam.questions.forEach((q) => {
          if (answers[q.id] === q.correctIndex) correct += 1
        })
        const score = Math.round((correct / exam.questions.length) * 100)
        const passed = score >= exam.passingScore
        const attempt = { score, passed, at: new Date().toISOString() }
        patch((s) => {
          let next = {
            ...s,
            enrollments: s.enrollments.map((e) => {
              if (e.userId !== userId || e.courseId !== courseId) return e
              return {
                ...e,
                examAttempts: [...e.examAttempts, attempt],
                examPassed: e.examPassed || passed,
                completedAt: e.examPassed || passed ? e.completedAt || attempt.at : e.completedAt,
              }
            }),
          }
          const course = s.courses.find((c) => c.id === courseId)
          return pushNote(next, {
            userId,
            title: passed ? 'نجاح في التقييم' : 'نتيجة التقييم',
            titleEn: passed ? 'Assessment passed' : 'Assessment result',
            body: `${course ? course.title : ''} — ${score}%`,
            bodyEn: `${course ? course.titleEn || course.title : ''} — ${score}%`,
            href: passed ? `/exams/${courseId}` : `/exams/${courseId}`,
          })
        })
        return { ok: true, score, passed, passingScore: exam.passingScore }
      },

      issueCertificate: (userId, courseId) => {
        const en = enrollment(userId, courseId)
        const course = courseById(courseId)
        if (!en || !en.examPassed || !course?.certificateEligible) {
          return { ok: false, error: state.lang === 'en' ? 'Not eligible yet.' : 'غير مؤهل بعد.' }
        }
        if (en.certificateId) {
          const existing = state.certificates.find((c) => c.id === en.certificateId)
          return { ok: true, certificate: existing }
        }
        const cert = {
          id: uid('cert'),
          code: certCode(),
          userId,
          courseId,
          instructorId: course.instructorId,
          issuedAt: new Date().toISOString(),
          status: 'valid',
        }
        patch((s) => pushNote({
          ...s,
          certificates: [...s.certificates, cert],
          enrollments: s.enrollments.map((e) =>
            e.userId === userId && e.courseId === courseId
              ? { ...e, certificateId: cert.id, completedAt: e.completedAt || cert.issuedAt }
              : e,
          ),
        }, {
          userId,
          title: 'صدرت شهادة إتمام',
          titleEn: 'Completion certificate issued',
          body: `${course.title} — ${cert.code}`,
          bodyEn: `${course.titleEn || course.title} — ${cert.code}`,
          href: `/certificates/${cert.code}`,
        }))
        return { ok: true, certificate: cert }
      },

      setCertificateStatus: (id, status) => {
        patch((s) => ({
          ...s,
          certificates: s.certificates.map((c) => (c.id === id ? { ...c, status } : c)),
        }))
      },

      logVerification: (code, result) => {
        patch((s) => ({
          ...s,
          verificationLogs: [
            { id: uid('vlog'), code, result, at: new Date().toISOString(), source: 'public' },
            ...(s.verificationLogs || []),
          ],
        }))
      },

      markNotificationRead: (id) => {
        patch((s) => ({
          ...s,
          notifications: (s.notifications || []).map((n) => (n.id === id ? { ...n, read: true } : n)),
        }))
      },

      upsertUser: (record) => {
        if (record.id === 'u-admin') {
          record = { ...record, id: 'u-admin', role: 'admin' }
        }
        patch((s) => {
          const exists = s.users.some((u) => u.id === record.id)
          return {
            ...s,
            users: exists
              ? s.users.map((u) => (u.id === record.id ? { ...u, ...record } : u))
              : [...s.users, { ...record, id: record.id || uid('u') }],
          }
        })
      },
      removeUser: (id) => {
  if (id === 'u-admin') return
  patch((s) => ({
    ...s,
    users: s.users.filter((u) => u.id !== id),
    sessionUserId: s.sessionUserId === id ? null : s.sessionUserId,
  }))
},

      upsertCourse: (record) => {
        patch((s) => {
          const exists = s.courses.some((c) => c.id === record.id)
          const next = {
            lessons: [],
            rating: 0,
            ratingCount: 0,
            enrolledCount: 0,
            price: 0,
            currency: 'USD',
            certificateEligible: true,
            featured: false,
            level: 'beginner',
            durationHours: 10,
            objectives: [],
            objectivesEn: [],
            requirements: [],
            requirementsEn: [],
            ...record,
            id: record.id || uid('c'),
          }
          return {
            ...s,
            courses: exists ? s.courses.map((c) => (c.id === record.id ? { ...c, ...record } : c)) : [...s.courses, next],
          }
        })
      },
      removeCourse: (id) => patch((s) => ({ ...s, courses: s.courses.filter((c) => c.id !== id) })),

      addLesson: (courseId, lesson) => {
        patch((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id === courseId
              ? { ...c, lessons: [...c.lessons, { ...lesson, id: lesson.id || uid('l'), order: c.lessons.length + 1 }] }
              : c,
          ),
        }))
      },
      updateLesson: (courseId, lessonId, fields) => {
        patch((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id !== courseId
              ? c
              : { ...c, lessons: c.lessons.map((l) => (l.id === lessonId ? { ...l, ...fields } : l)) },
          ),
        }))
      },
      removeLesson: (courseId, lessonId) => {
        patch((s) => ({
          ...s,
          courses: s.courses.map((c) =>
            c.id !== courseId
              ? c
              : { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId).map((l, i) => ({ ...l, order: i + 1 })) },
          ),
        }))
      },

      upsertCategory: (record) => {
        patch((s) => {
          const exists = s.categories.some((c) => c.id === record.id)
          return {
            ...s,
            categories: exists
              ? s.categories.map((c) => (c.id === record.id ? { ...c, ...record } : c))
              : [...s.categories, { ...record, id: record.id || uid('cat') }],
          }
        })
      },
      removeCategory: (id) => patch((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) })),

      upsertExam: (record) => {
        patch((s) => {
          const exists = s.exams.some((e) => e.id === record.id)
          const next = {
            passingScore: 70,
            timeLimitMin: 20,
            questions: [],
            ...record,
            id: record.id || uid('e'),
          }
          return {
            ...s,
            exams: exists ? s.exams.map((e) => (e.id === record.id ? { ...e, ...record } : e)) : [...s.exams, next],
          }
        })
      },
      addQuestion: (examId, question) => {
        patch((s) => ({
          ...s,
          exams: s.exams.map((e) =>
            e.id === examId
              ? { ...e, questions: [...e.questions, { ...question, id: question.id || uid('q') }] }
              : e,
          ),
        }))
      },
      updateQuestion: (examId, questionId, fields) => {
        patch((s) => ({
          ...s,
          exams: s.exams.map((e) =>
            e.id !== examId
              ? e
              : { ...e, questions: e.questions.map((q) => (q.id === questionId ? { ...q, ...fields } : q)) },
          ),
        }))
      },
      removeQuestion: (examId, questionId) => {
        patch((s) => ({
          ...s,
          exams: s.exams.map((e) =>
            e.id === examId ? { ...e, questions: e.questions.filter((q) => q.id !== questionId) } : e,
          ),
        }))
      },

      upsertPath: (record) => {
        patch((s) => {
          const exists = s.paths.some((p) => p.id === record.id)
          const next = {
            courseIds: [],
            outcomes: [],
            outcomesEn: [],
            durationHours: 0,
            level: 'professional',
            image: '/images/hero-lab.jpg',
            ...record,
            id: record.id || uid('p'),
            slug: record.slug || String(record.titleEn || record.title || 'path').toLowerCase().replace(/\s+/g, '-'),
          }
          return {
            ...s,
            paths: exists ? s.paths.map((p) => (p.id === record.id ? { ...p, ...record } : p)) : [...s.paths, next],
          }
        })
      },
      removePath: (id) => patch((s) => ({ ...s, paths: s.paths.filter((p) => p.id !== id) })),

      upsertArticle: (record) => {
        patch((s) => {
          const exists = s.articles.some((a) => a.id === record.id)
          const next = { ...record, id: record.id || uid('a'), publishedAt: record.publishedAt || new Date().toISOString() }
          return { ...s, articles: exists ? s.articles.map((a) => (a.id === record.id ? { ...a, ...record } : a)) : [...s.articles, next] }
        })
      },
      removeArticle: (id) => patch((s) => ({ ...s, articles: s.articles.filter((a) => a.id !== id) })),

      updateHomepage: (fields) => patch((s) => ({ ...s, homepage: { ...s.homepage, ...fields } })),
      updateSettings: (fields) => patch((s) => ({ ...s, settings: { ...s.settings, ...fields } })),
      updateCertificateTemplate: (fields) =>
        patch((s) => ({ ...s, certificateTemplate: { ...s.certificateTemplate, ...fields } })),

      instructorMarkComplete: (userId, courseId) => {
        const course = courseById(courseId)
        if (!course) return
        patch((s) => ({
          ...s,
          enrollments: s.enrollments.map((e) => {
            if (e.userId !== userId || e.courseId !== courseId) return e
            return { ...e, completedLessonIds: course.lessons.map((l) => l.id) }
          }),
        }))
      },

      resetDemo: () => {
        const fresh = createInitialState()
        fresh.lang = state.lang
        setState(fresh)
        localStorage.removeItem(STORAGE_KEY)
      },
    }
  }, [state, patch])

  const value = {
    state,
    user,
    hydrated,
    toasts,
    toast,
    ...api,
    t: (path) => {
      const segs = path.split('.')
      let cur = dictionaries[state.lang] || dictionaries.ar
      for (const s of segs) cur = cur?.[s]
      return cur == null ? path : cur
    },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp outside provider')
  return ctx
}
