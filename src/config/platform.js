/**
 * Platform configuration map
 * --------------------------------
 * Branding:            src/config/brand.js  +  CSS :root in src/index.css
 * Courses / instructors / exams / articles / paths:
 *                      src/data/seed.js
 * Certificate wording: state.certificateTemplate (seed + Admin → Template)
 * Accreditation flag:  state.settings.accreditationEnabled  (OFF by default)
 * Persistence today:   localStorage key in src/store/AppStore.jsx
 * Persistence later:   replace loadState / patch in AppStore with API calls;
 *                      page components already speak only through useApp().
 */
export const STORAGE_KEY = 'medad.platform.v1'

export const ROLES = ['student', 'instructor', 'admin']
