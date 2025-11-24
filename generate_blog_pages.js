// Script to generate HTML blog pages from markdown files in Blogs/
// and update posts.json

const fs = require('fs');
const path = require('path');
const marked = require('marked');
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
    const html = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n  <title>${meta.title}</title>\n  <link rel=\"stylesheet\" href=\"${stylesHref}\" />\n  <meta name=\"description\" content=\"${meta.summary}\" />\n</head>\n<body id=\"top\">\n${headerHtml}\n<main class=\"page blog-main\">\n<article class=\"blog-post-ref\">\n  <h1 class=\"blog-title\">${meta.title}</h1>\n  <p class=\"blog-summary\">${meta.summary}</p>\n  <div class=\"blog-meta-row\">\n    <span class=\"blog-tags\">${(meta.tags || []).map(tag => `<span class=\"blog-tag\">${tag}</span>`).join('')}</span>\n    <span class=\"blog-date\">📅 ${meta.date}</span>\n  </div>\n  <hr />\n  <div class=\"blog-content\">${marked(content)}</div>\n</article>\n</main>\n</body>\n</html>`;
    const outPath = path.join(__dirname, meta.link);
    fs.writeFileSync(outPath, html, 'utf8');
  }
});

// Write posts.json in reverse chronological order
posts.sort((a, b) => new Date(b.date) - new Date(a.date));
fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2), 'utf8');

console.log('Blog pages and posts.json updated.');
