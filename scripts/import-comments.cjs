#!/usr/bin/env node
/**
 * Import WordPress comments to Cusdis
 * Usage: node import-comments.cjs
 */

const https = require('https');
const http = require('http');

const WP_API = 'https://advancedbiomass.com/wp-json/wp/v2';
const CUSDIS_HOST = 'https://comments.natinternet.com';
const APP_ID = '62274c3e-e32b-4dcc-a63f-cfbe2ef9959b';

// Post ID to slug mapping (we'll build this)
const postSlugs = {};

async function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${data.slice(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

async function getPostSlug(postId) {
  if (postSlugs[postId]) return postSlugs[postId];
  
  try {
    const post = await fetch(`${WP_API}/posts/${postId}`);
    postSlugs[postId] = post.slug;
    return post.slug;
  } catch (e) {
    console.error(`  Failed to get slug for post ${postId}:`, e.message);
    return null;
  }
}

async function getAllComments() {
  const comments = [];
  let page = 1;
  
  while (true) {
    console.log(`Fetching comments page ${page}...`);
    const batch = await fetch(`${WP_API}/comments?per_page=100&page=${page}`);
    
    if (!Array.isArray(batch) || batch.length === 0) break;
    
    comments.push(...batch);
    page++;
    
    if (batch.length < 100) break;
  }
  
  return comments;
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function importToCusdis(comment, slug) {
  const pageId = slug;
  const pageUrl = `https://v2.advancedbiomass.com/blog/${slug}/`;
  
  // Cusdis API endpoint for creating comments (internal)
  // We need to insert directly into the database since Cusdis
  // doesn't have a public import API
  
  return {
    pageId,
    pageUrl,
    nickname: comment.author_name,
    email: '', // WP API doesn't expose email
    content: stripHtml(comment.content.rendered),
    createdAt: new Date(comment.date_gmt + 'Z').toISOString(),
    approved: true
  };
}

async function main() {
  console.log('🔄 Fetching comments from WordPress...\n');
  
  const comments = await getAllComments();
  console.log(`\n📝 Found ${comments.length} comments\n`);
  
  const cusdisComments = [];
  
  for (const comment of comments) {
    const slug = await getPostSlug(comment.post);
    if (!slug) continue;
    
    const cusdisComment = await importToCusdis(comment, slug);
    cusdisComments.push(cusdisComment);
    
    console.log(`  ✓ ${comment.author_name} on "${slug}"`);
  }
  
  // Output SQL for direct database import
  console.log('\n\n=== SQL INSERT STATEMENTS ===\n');
  console.log('-- Run these inside the Cusdis container:');
  console.log('-- docker exec -it cusdis sqlite3 /app/prisma/sqlite/data/cusdis.db\n');
  
  // Group by page first
  const byPage = {};
  for (const c of cusdisComments) {
    if (!byPage[c.pageId]) byPage[c.pageId] = [];
    byPage[c.pageId].push(c);
  }
  
  // Generate SQL
  const projectId = APP_ID;
  let pageNum = 1;
  let commentNum = 1;
  
  for (const [pageId, pageComments] of Object.entries(byPage)) {
    const pageUuid = `imported-page-${pageNum}`;
    const pageUrl = pageComments[0].pageUrl;
    
    console.log(`-- Page: ${pageId}`);
    console.log(`INSERT OR IGNORE INTO pages (id, slug, url, title, projectId, created_at, updated_at) VALUES ('${pageUuid}', '${pageId}', '${pageUrl}', '${pageId}', '${projectId}', datetime('now'), datetime('now'));`);
    
    for (const c of pageComments) {
      const commentUuid = `imported-comment-${commentNum}`;
      const content = c.content.replace(/'/g, "''");
      const nickname = c.nickname.replace(/'/g, "''");
      
      console.log(`INSERT INTO comments (id, pageId, by_nickname, content, approved, created_at, updated_at) VALUES ('${commentUuid}', '${pageUuid}', '${nickname}', '${content}', 1, '${c.createdAt}', '${c.createdAt}');`);
      commentNum++;
    }
    
    console.log('');
    pageNum++;
  }
  
  console.log(`\n✅ Generated SQL for ${cusdisComments.length} comments across ${Object.keys(byPage).length} pages`);
}

main().catch(console.error);
