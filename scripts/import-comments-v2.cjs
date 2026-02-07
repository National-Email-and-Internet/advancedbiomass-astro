#!/usr/bin/env node
const https = require('https');

const WP_API = 'https://advancedbiomass.com/wp-json/wp/v2';
const APP_ID = '62274c3e-e32b-4dcc-a63f-cfbe2ef9959b';

const postSlugs = {};

async function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function getPostSlug(postId) {
  if (postSlugs[postId]) return postSlugs[postId];
  const post = await fetch(`${WP_API}/posts/${postId}`);
  postSlugs[postId] = post.slug;
  return post.slug;
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .replace(/&#8230;/g, '...')
    .replace(/&#038;/g, '&')
    .replace(/&#8243;/g, '"')
    .replace(/&#8242;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escSql(str) {
  return str.replace(/'/g, "''");
}

async function main() {
  console.error('Fetching comments...');
  
  let comments = [];
  let page = 1;
  while (true) {
    const batch = await fetch(`${WP_API}/comments?per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    comments.push(...batch);
    page++;
    if (batch.length < 100) break;
  }
  
  console.error(`Found ${comments.length} comments`);
  
  // Group by page
  const byPage = {};
  for (const c of comments) {
    const slug = await getPostSlug(c.post);
    if (!slug) continue;
    if (!byPage[slug]) byPage[slug] = [];
    byPage[slug].push({
      nickname: c.author_name,
      content: stripHtml(c.content.rendered),
      createdAt: new Date(c.date_gmt + 'Z').toISOString()
    });
  }
  
  // Output SQL
  let pageNum = 1;
  let commentNum = 1;
  
  for (const [slug, pageComments] of Object.entries(byPage)) {
    const pageUuid = `imported-page-${pageNum}`;
    const pageUrl = `https://v2.advancedbiomass.com/blog/${slug}/`;
    
    console.log(`INSERT OR IGNORE INTO pages (id, slug, url, title, projectId, created_at, updated_at) VALUES ('${pageUuid}', '${escSql(slug)}', '${pageUrl}', '${escSql(slug)}', '${APP_ID}', datetime('now'), datetime('now'));`);
    
    for (const c of pageComments) {
      const commentUuid = `imported-comment-${commentNum}`;
      console.log(`INSERT INTO comments (id, pageId, by_nickname, content, approved, created_at, updated_at) VALUES ('${commentUuid}', '${pageUuid}', '${escSql(c.nickname)}', '${escSql(c.content)}', 1, '${c.createdAt}', '${c.createdAt}');`);
      commentNum++;
    }
    pageNum++;
  }
  
  console.error(`Generated SQL for ${commentNum - 1} comments across ${pageNum - 1} pages`);
}

main().catch(console.error);
