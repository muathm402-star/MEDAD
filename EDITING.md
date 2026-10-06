# Editing MEDAD V1

All UI is React source — nothing is flattened to images. Change files below and the platform updates.

| What to change | Where |
| --- | --- |
| Colors / typography tokens | `src/config/brand.js` and `:root` in `src/index.css` |
| Logo | `public/brand/logo-mark.png` and Admin → Branding |
| Courses, lessons, instructors, exams, articles, paths | `src/data/seed.js` **or** Admin CMS |
| Homepage copy | `src/data/seed.js` `homepage` **or** Admin → Homepage |
| Certificate wording | `src/data/seed.js` `certificateTemplate` **or** Admin → Template |
| Accreditation (OFF by default) | Admin → Settings. Never enable without a real partnership. |
| Arabic / English UI strings | `src/i18n/index.js` |
| Persistence | `src/store/AppStore.jsx` — swap `loadState` / `patch` for an API later. Pages already use `useApp()` only. |

Demo accounts (password `Medad@2026`):

- `student@medad.edu`
- `instructor@medad.edu`
- `admin@medad.edu`

Sample certificate: `MD-2026-7F3K91`
