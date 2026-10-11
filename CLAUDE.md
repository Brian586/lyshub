# lyshub — lyshub.com

Lyshub Technologies' marketing site: a hand-written static site (no build step). It uses
vanilla ES modules and its own design system, `assets/css/converta.css` (DM Sans,
`--primary` #4C6FFF). Hosted on Firebase Hosting, project `lyshub-technologies`.

## Projects come from Firestore

The Projects page, the home-page projects strip and the project detail page read
**published projects from Firestore**. Brian manages them in the admin portal at `/admin`.
If Firestore is unreachable or has nothing published, the pages fall back to the built-in
list in `assets/js/data/projects-data.js`, so the site never goes blank.

| File | Role |
|---|---|
| `assets/js/firebase.js` | Firebase app and Firestore. `?emulator=1` on localhost switches to the emulators. |
| `assets/js/projects-store.js` | **The only module that talks to Firestore.** Lists, saves, chunked uploads, deletes. |
| `assets/js/projects-source.js` | Public pages: Firestore first, then the built-in fallback, normalised to one shape. |
| `assets/js/text.js` | `escapeHtml`, `renderDescription`, `formatBytes`. No dependencies. |
| `assets/js/projects.js`, `project-details.js` | The public pages. The detail page renders the **media kit**. |
| `admin/index.html`, `admin/edit.html`, `admin/js/*` | The admin portal: sign-in, project list, editor. |
| `firestore.rules` | Security rules. **Deploy them** (`firebase deploy --only firestore:rules`) whenever they change. |

### Data model

There is **no Cloud Storage** on this Firebase project, so files live inside Firestore
documents, which are capped at 1 MiB each.

```
admins/{uid}                         {email}. Who may use /admin. Added by hand in the console.
projects/{id}                        title, tag, client, location, website, date (display string),
                                     shortDescription, description (plain text: blank line = paragraph,
                                     **bold**), published, order, cover {data: WebP data URL ≤ 250 KB,
                                     width, height}, media: [{id, kind: image|video, title, format,
                                     name, mime, bytes, chunks, width, height, thumb: WebP ≤ 40 KB}],
                                     createdAt, updatedAt, updatedBy
projects/{id}/chunks/{mediaId}_{n}   {media, n, data: Bytes ≤ 900 KB}. The file's bytes, in order.
```

- Chunks are Firestore **Bytes**, not base64 strings. They live in the same documents but are a
  third smaller.
- The project document holds the cover and every thumbnail inline, so it must stay under about
  950 KB. `saveProject` and `uploadMedia` refuse to go over that.
- `format` is one of `4x5 · 9x16 · 1x1 · 16x9 · a4 · other`, detected from the file's dimensions.
  Media with the same `title` render as one card with a button per size.
- The public list query is `where("published", "==", true)`, sorted in the browser by
  `order`. That's deliberate: there's no composite index to maintain.
- A video plays only after all its chunks download. Upload the `-web` exports (720p, 1.5 Mbps
  or less), not the full-size ones. A 35 s promo is then about 6 MB in 7 chunks.

### Rules

1. **Escape everything from Firestore** before it reaches `innerHTML` (`escapeHtml`,
   `renderDescription`). Only the built-in `projects-data.js` is trusted HTML.
2. **Admin sign-in:** Google and email + password only (the house four-methods rule allows
   both).
3. `/admin` is `noindex` and disallowed in `robots.txt`. Its security is the rules, not obscurity.
4. Keep `projects-data.js` working as the fallback. Remove an entry from it only once that
   project is in Firestore.

### Testing locally

```bash
cd c:/src/html/lyshub
firebase emulators:start --only firestore,auth      # Firestore :8080, Auth :9099, using firestore.rules
node <serve.mjs> . 8770                             # any static server that sends .js as text/javascript
# open http://127.0.0.1:8770/admin/index.html?emulator=1
```

Create users in the Auth emulator and an `admins/{uid}` document (REST with
`Authorization: Bearer owner`). `tools/e2e/` holds a scripted run of the whole flow:
`node e2e_setup.mjs`, then `node e2e_1.mjs` (sign-in, denied, import) and `node e2e_2.mjs`
(create a project, upload, view, play).

## First-time setup on the live project (Brian, once)

1. Firebase console → **Authentication** → Sign-in method: enable **Google** and **Email/Password**.
   Add your account under Users if you'll use a password.
2. Firebase console → **Firestore**: create the database (production mode), if it doesn't exist.
3. `cd c:/src/html/lyshub && firebase deploy --only firestore:rules`.
4. Sign in at `lyshub.com/admin`. The "Not an admin yet" screen shows your uid. Add
   `admins/{that uid}` in the Firestore console, then reload.
5. **Import the site's current projects**, then add new ones.
6. `firebase deploy --only hosting` to publish the site changes.
