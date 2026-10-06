import { Link, useParams } from 'react-router-dom'
import { useApp } from '../store/AppStore'

export function Articles() {
  const { state, loc, t, userById, categoryById } = useApp()
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{t('nav.articles')}</h1>
          <p>{t('home.articles')}</p>
        </div>
      </div>
      <section className="section">
        <div className="container grid-2">
          {state.articles.map((a) => {
            const author = userById(a.authorId)
            const cat = categoryById(a.category)
            return (
              <Link key={a.id} to={`/articles/${a.slug}`} className="card">
                <div className="card-media"><img src={a.image} alt="" /></div>
                <div className="card-body">
                  <div className="small muted">{cat ? loc(cat, 'name') : a.category} · {a.readMin} {state.lang === 'en' ? 'min' : 'دقيقة'}</div>
                  <h3>{loc(a, 'title')}</h3>
                  <p className="muted">{loc(a, 'excerpt')}</p>
                  <span className="small">{author ? loc(author, 'name') : ''}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}

export function Article() {
  const { slug } = useParams()
  const { state, loc, userById } = useApp()
  const a = state.articles.find((x) => x.slug === slug)
  if (!a) return <div className="section container"><div className="empty">—</div></div>
  const author = userById(a.authorId)
  return (
    <article className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="article-cover mb"><img src={a.image} alt="" /></div>
        <h1>{loc(a, 'title')}</h1>
        <p className="muted">{author ? loc(author, 'name') : ''} · {new Date(a.publishedAt).toLocaleDateString()} · {a.readMin}</p>
        <div className="prose">
          <p><strong>{loc(a, 'excerpt')}</strong></p>
          <p>{loc(a, 'content')}</p>
        </div>
      </div>
    </article>
  )
}
