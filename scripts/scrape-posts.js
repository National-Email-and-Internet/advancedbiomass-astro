// Blog post URLs to scrape
const posts = [
  'see-new-article-on-the-design-of-conveyors-for-extreme-northern-climates',
  'biomass-handling-system-design-–-things-to-consider',
  'handling-pellets-things-to-consider',
  'so-you-want-to-build-a-biomass-plant',
  'rock-removal-from-woody-biomass',
  'chip-biomass-pile-inventory-management',
  'biomass-storage-pile-basics',
  'biomass-dust-fire-and-explosion-control',
  'screens-for-woody-biomass',
  'disc-screen-fundamentals',
  'helical-chute-for-wood-pellets',
  'determining-the-natural-compaction-of-a-biomass-pile',
  'biomass-trucks-and-dumpers',
  'the-benefits-of-chip-thickness-screening',
  'a-practical-guide-to-metrication',
  'plastic-contamination-in-pulp',
  'chip-storage-and-handling-for-pulp-mills',
  'vendor-documentation-requirements',
  'project-definition-and-planning',
  'conveyor-safety-and-guarding',
  'solid-biofuel-standards',
  'transporting-woody-biomass-by-rail',
  'sprocket-wear-and-chain-run-direction'
];

console.log('Posts to scrape:', posts.length);
posts.forEach((post, index) => {
  console.log(`${index + 1}. ${post}`);
});