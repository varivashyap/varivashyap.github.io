// Script to generate HTML blog pages from markdown files in Blogs/
// and update posts.json

const fs = require('fs');
const path = require('path');
const { marked } = require('marked'); // <-- fixed import
const matter = require('gray-matter');

const blogsDir = path.join(__dirname, 'Blogs');
const postsJsonPath = path.join(__dirname, 'posts.json');
const stylesHref = 'styles.css';

// Extract header from blog.html
const blogHtml = fs.readFileSync(path.join(__dirname, 'blog.html'), 'utf8');
const headerMatch = blogHtml.match(/<header[\s\S]*?<\/header>/);
const headerHtml = headerMatch ? headerMatch[0] : '';

function getFrontMatterDefaults() {
  return {
    title: 'Untitled',
    summary: '',
    date: new Date().toISOString().slice(0, 10),
    tags: [],
    link: '',
  };
}

const posts = [];

fs.readdirSync(blogsDir).forEach(file => {
  if (file.endsWith('.md')) {
    const mdPath = path.join(blogsDir, file);
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const { data, content } = matter(mdContent);
    const meta = Object.assign(getFrontMatterDefaults(), data);
    meta.link = file.replace(/\.md$/, '.html');
    posts.push(meta);

    // Generate HTML page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${meta.title}</title>
  <link rel="stylesheet" href="${stylesHref}" />
  <meta name="description" content="${meta.summary}" />
</head>
<body id="top">
${headerHtml}
<main class="page blog-main">
<article class="blog-post-ref">
  <h1 class="blog-title">${meta.title}</h1>
  <p class="blog-summary">${meta.summary}</p>
  <div class="blog-meta-row">
    <span class="blog-tags">${(meta.tags || []).map(tag => `<span class="blog-tag">${tag}</span>`).join('')}</span>
    <span class="blog-date">📅 ${meta.date}</span>
  </div>
  <hr />
  <div class="blog-content">${marked(content)}</div>
</article>
</main>
</body>
</html>`;
    const outPath = path.join(__dirname, meta.link);
    fs.writeFileSync(outPath, html, 'utf8');
  }
});

// Write posts.json in reverse chronological order
posts.sort((a, b) => new Date(b.date) - new Date(a.date));
fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');

console.log('Blog pages and posts.json updated.');
