const TurndownService = require('turndown');
const fs = require('fs');
const path = require('path');

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Keep images with proper paths
turndown.addRule('images', {
  filter: 'img',
  replacement: (content, node) => {
    const src = node.getAttribute('src') || '';
    const alt = node.getAttribute('alt') || '';
    // Extract just the filename from WordPress uploads path
    const filename = src.split('/').pop();
    if (filename && (filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.gif'))) {
      return `![${alt}](/images/${filename})`;
    }
    return '';
  }
});

// Remove links around images (WordPress wraps images in links)
turndown.addRule('imageLinks', {
  filter: (node) => {
    return node.nodeName === 'A' && 
           node.querySelector('img') && 
           node.getAttribute('href')?.includes('uploads');
  },
  replacement: (content, node) => {
    const img = node.querySelector('img');
    if (img) {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      const filename = src.split('/').pop();
      if (filename) {
        return `\n\n![${alt}](/images/${filename})\n\n`;
      }
    }
    return content;
  }
});

async function fetchArticle(slug) {
  const url = `https://advancedbiomass.com/${slug}/`;
  console.log(`Fetching: ${url}`);
  
  const response = await fetch(url);
  const html = await response.text();
  
  // Extract article content - look for entry-content div
  const contentMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<footer/i) ||
                       html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  
  if (!contentMatch) {
    console.log(`  Could not find content for ${slug}`);
    return null;
  }
  
  let content = contentMatch[1];
  
  // Remove script tags, style tags, and other junk
  content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
  content = content.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove share buttons and related posts sections
  content = content.replace(/<div[^>]*class="[^"]*sharedaddy[^"]*"[\s\S]*?<\/div>/gi, '');
  content = content.replace(/<div[^>]*class="[^"]*jp-relatedposts[^"]*"[\s\S]*?<\/div>/gi, '');
  
  // Convert to markdown
  const markdown = turndown.turndown(content);
  
  // Clean up extra whitespace
  return markdown
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
}

async function getExistingFrontmatter(slug) {
  const mdPath = path.join(__dirname, '..', 'src', 'content', 'posts', `${slug}.md`);
  if (!fs.existsSync(mdPath)) return null;
  
  const content = fs.readFileSync(mdPath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (match) {
    return match[0];
  }
  return null;
}

async function processArticle(slug) {
  console.log(`\n=== Processing: ${slug} ===`);
  
  const frontmatter = await getExistingFrontmatter(slug);
  if (!frontmatter) {
    console.log(`  No existing frontmatter found, skipping`);
    return;
  }
  
  const content = await fetchArticle(slug);
  if (!content) return;
  
  // Count images
  const imageCount = (content.match(/!\[/g) || []).length;
  console.log(`  Found ${imageCount} images`);
  
  // Write new markdown file
  const mdPath = path.join(__dirname, '..', 'src', 'content', 'posts', `${slug}.md`);
  const newContent = `${frontmatter}\n\n${content}\n`;
  
  fs.writeFileSync(mdPath, newContent);
  console.log(`  ✓ Saved ${slug}.md`);
}

async function main() {
  const articles = [
    "biomass-dust-fire-and-explosion-control",
    "biomass-storage-pile-basics",
    "biomass-trucks-and-dumpers",
    "chip-biomass-pile-inventory-management",
    "chip-storage-and-handling-for-pulp-mills",
    "conveyor-safety-and-guarding",
    "determining-the-natural-compaction-of-a-biomass-pile",
    "disc-screen-fundamentals",
    "handling-pellets-things-to-consider",
    "helical-chute-for-wood-pellets",
    "plastic-contamination-in-pulp",
    "project-definition-and-planning",
    "rock-removal-from-woody-biomass",
    "screens-for-woody-biomass",
    "see-new-article-on-the-design-of-conveyors-for-extreme-northern-climates",
    "see-new-post-on-biomass-sampling",
    "solid-biofuel-standards",
    "so-you-want-to-build-a-biomass-plant",
    "sprocket-wear-and-chain-run-direction",
    "the-benefits-of-chip-thickness-screening",
    "transporting-woody-biomass-by-rail",
    "vendor-documentation-requirements"
  ];
  
  for (const slug of articles) {
    await processArticle(slug);
  }
  
  console.log('\n=== All articles processed ===');
}

main().catch(console.error);
