import { readFile, writeFile } from "node:fs/promises";

const posts = JSON.parse(await readFile("content/posts.json", "utf8"));

const cards = posts.map((post) => `        <article class="post-card">
          <a href="/posts/${post.slug}.html">
            <img src="${post.cover}" alt="${escapeHtml(post.coverAlt)}">
            <div>
              <p class="date">${escapeHtml(post.date)}</p>
              <h2>${escapeHtml(post.title)}</h2>
              <p>${escapeHtml(post.summary)}</p>
            </div>
          </a>
        </article>`).join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Roger Gao Wei Blog</title>
    <meta name="description" content="Personal essays and trip notes by Roger Gao Wei.">
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/">Roger Gao Wei</a>
      <nav>
        <a href="https://rogergaowei.com">Home</a>
      </nav>
    </header>

    <main class="page">
      <section class="intro">
        <p class="eyebrow">Personal Blog</p>
        <h1>Notes, trips, and things I am learning.</h1>
      </section>

      <section class="post-list" aria-label="Posts">
${cards}
      </section>
    </main>
  </body>
</html>
`;

await writeFile("index.html", html);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
