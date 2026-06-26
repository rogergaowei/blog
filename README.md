# Roger Gao Wei Blog

Minimal static blog for `blog.rogergaowei.com`.

## Add a Google Doc post

Add the Google Doc URL to `content/google-docs.json`, then ask Codex to sync the blog. Codex will export the document, copy images into `assets/`, create the article page, update `content/posts.json`, run `node scripts/build-index.mjs`, and push the result.

If a document shows `needs_access`, open the Google Doc sharing settings and allow the Codex-connected Google account to read it, or set link access to viewer.

## Deploy on Cloudflare Pages

- Framework preset: `None`
- Build command: leave empty
- Build output directory: `/`
- Custom domain: `blog.rogergaowei.com`

The first post was adapted from the Google Doc titled `A trip to California`.
