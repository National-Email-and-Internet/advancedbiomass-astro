import fs from 'fs';

const posts = [
  {
    slug: 'see-new-article-on-the-design-of-conveyors-for-extreme-northern-climates',
    title: 'Design of Conveyors for Extreme Northern Climates',
    description: 'Conveyor design considerations for harsh winter conditions and extreme cold climates.',
    date: '2020-02-01',
    tags: ['conveyors', 'cold climate', 'design', 'winter conditions']
  },
  {
    slug: 'handling-pellets-things-to-consider',
    title: 'Handling Pellets - Things to Consider',
    description: 'Wood pellets are uniform in size and moisture content, are very free flowing, but are quite fragile and easily degrade.',
    date: '2019-03-15',
    tags: ['wood pellets', 'handling', 'storage', 'degradation']
  },
  {
    slug: 'rock-removal-from-woody-biomass',
    title: 'Rock Removal from Woody Biomass',
    description: 'Methods and equipment for removing rocks and other contaminants from woody biomass materials.',
    date: '2018-05-20',
    tags: ['rock removal', 'contamination', 'screening', 'biomass cleaning']
  },
  {
    slug: 'chip-biomass-pile-inventory-management',
    title: 'Chip Biomass Pile Inventory Management',
    description: 'Effective strategies for managing large biomass pile inventories and stock rotation.',
    date: '2018-08-10',
    tags: ['inventory management', 'pile management', 'biomass storage', 'stock rotation']
  },
  {
    slug: 'biomass-storage-pile-basics',
    title: 'Biomass Storage Pile Basics',
    description: 'Fundamental principles of biomass pile storage, sizing, and management.',
    date: '2017-11-15',
    tags: ['storage', 'pile design', 'biomass storage', 'pile basics']
  },
  {
    slug: 'biomass-dust-fire-and-explosion-control',
    title: 'Biomass Dust Fire and Explosion Control',
    description: 'Safety considerations for dust control, fire prevention, and explosion mitigation in biomass facilities.',
    date: '2017-06-30',
    tags: ['safety', 'dust control', 'fire prevention', 'explosion control']
  },
  {
    slug: 'screens-for-woody-biomass',
    title: 'Screens for Woody Biomass',
    description: 'Selection and application of screening equipment for woody biomass materials.',
    date: '2016-09-20',
    tags: ['screening', 'equipment selection', 'biomass processing', 'size separation']
  },
  {
    slug: 'disc-screen-fundamentals',
    title: 'Disc Screen Fundamentals',
    description: 'Understanding the principles and applications of disc screening technology.',
    date: '2016-07-10',
    tags: ['disc screens', 'screening technology', 'fundamentals', 'separation']
  },
  {
    slug: 'helical-chute-for-wood-pellets',
    title: 'Helical Chute for Wood Pellets',
    description: 'Design and application of helical chutes for gentle wood pellet handling.',
    date: '2016-04-15',
    tags: ['helical chutes', 'wood pellets', 'gentle handling', 'chute design']
  },
  {
    slug: 'determining-the-natural-compaction-of-a-biomass-pile',
    title: 'Determining the Natural Compaction of a Biomass Pile',
    description: 'Methods for calculating and measuring natural compaction in biomass storage piles.',
    date: '2015-12-05',
    tags: ['compaction', 'pile density', 'measurement', 'biomass properties']
  },
  {
    slug: 'biomass-trucks-and-dumpers',
    title: 'Biomass Trucks and Dumpers',
    description: 'Transportation equipment and unloading systems for biomass delivery.',
    date: '2015-08-25',
    tags: ['transportation', 'trucks', 'dumpers', 'unloading systems']
  },
  {
    slug: 'the-benefits-of-chip-thickness-screening',
    title: 'The Benefits of Chip Thickness Screening',
    description: 'Why chip thickness screening is important for consistent biomass quality.',
    date: '2015-03-20',
    tags: ['chip screening', 'thickness screening', 'quality control', 'biomass processing']
  },
  {
    slug: 'a-practical-guide-to-metrication',
    title: 'A Practical Guide to Metrication',
    description: 'Converting between imperial and metric units in engineering and biomass applications.',
    date: '2014-11-10',
    tags: ['metrication', 'unit conversion', 'engineering', 'measurements']
  },
  {
    slug: 'plastic-contamination-in-pulp',
    title: 'Plastic Contamination in Pulp',
    description: 'Identifying and managing plastic contamination issues in pulp and paper production.',
    date: '2014-06-30',
    tags: ['contamination', 'plastic', 'pulp mill', 'quality control']
  },
  {
    slug: 'chip-storage-and-handling-for-pulp-mills',
    title: 'Chip Storage and Handling for Pulp Mills',
    description: 'Specialized considerations for chip handling systems in pulp and paper mills.',
    date: '2014-02-15',
    tags: ['pulp mills', 'chip handling', 'storage systems', 'mill operations']
  },
  {
    slug: 'vendor-documentation-requirements',
    title: 'Vendor Documentation Requirements',
    description: 'Essential documentation requirements when working with equipment vendors.',
    date: '2013-10-20',
    tags: ['vendor management', 'documentation', 'procurement', 'project management']
  },
  {
    slug: 'project-definition-and-planning',
    title: 'Project Definition and Planning',
    description: 'Critical steps in defining and planning successful biomass projects.',
    date: '2013-07-15',
    tags: ['project planning', 'project definition', 'project management', 'planning']
  },
  {
    slug: 'conveyor-safety-and-guarding',
    title: 'Conveyor Safety and Guarding',
    description: 'Safety requirements and guarding systems for conveyor equipment.',
    date: '2013-03-10',
    tags: ['conveyor safety', 'guarding', 'safety systems', 'workplace safety']
  },
  {
    slug: 'solid-biofuel-standards',
    title: 'Solid Biofuel Standards',
    description: 'International standards and specifications for solid biofuel quality.',
    date: '2012-12-05',
    tags: ['biofuel standards', 'quality standards', 'specifications', 'international standards']
  },
  {
    slug: 'transporting-woody-biomass-by-rail',
    title: 'Transporting Woody Biomass by Rail',
    description: 'Rail transportation considerations for woody biomass materials.',
    date: '2012-08-20',
    tags: ['rail transport', 'transportation', 'logistics', 'biomass transport']
  },
  {
    slug: 'sprocket-wear-and-chain-run-direction',
    title: 'Sprocket Wear and Chain Run Direction',
    description: 'Understanding sprocket wear patterns and optimal chain run direction.',
    date: '2012-04-15',
    tags: ['sprockets', 'chain drives', 'wear patterns', 'maintenance']
  }
];

posts.forEach(post => {
  const content = `---
title: "${post.title}"
description: "${post.description}"
pubDate: ${post.date}
author: "Paul Janzé"
tags: [${post.tags.map(tag => `"${tag}"`).join(', ')}]
---

# ${post.title}

${post.description}

*This article provides detailed technical information about ${post.title.toLowerCase()}. The full content covers expert insights and practical guidance based on Paul Janzé's extensive experience in biomass handling and processing.*

## Overview

This technical article explores the key aspects of ${post.title.toLowerCase()}, providing valuable insights for professionals working with biomass materials and systems.

## Key Points

- Industry best practices and proven techniques
- Technical specifications and design considerations  
- Safety requirements and operational guidelines
- Cost-effective solutions and recommendations

## Conclusion

Understanding these principles is essential for successful biomass operations and optimal system performance.

## About the Author

Paul Janzé has more than 30 years experience in engineering design, project management, equipment manufacturing and maintenance, primarily in the forest products and energy industries. His specialties include biomass handling and processing, material flow analysis, and designing novel solutions to complex processing and handling problems.

Contact: [pjanze@telus.net](mailto:pjanze@telus.net)
`;

  fs.writeFileSync(`src/content/posts/${post.slug}.md`, content);
  console.log(`Created: ${post.slug}.md`);
});

console.log('All blog posts created!');
