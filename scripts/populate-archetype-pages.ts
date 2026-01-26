/**
 * Populate archetype_pages table from generated JSON files
 * Run with: npx tsx scripts/populate-archetype-pages.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface ArchetypePageData {
  slug: string;
  archetype: {
    id: string;
    name: string;
    description: string;
  };
  app: string;
  meta: {
    title: string;
    description: string;
  };
  examples: Array<{
    bio: string;
    whyItWorks: string;
  }>;
  relatedPages: Array<{
    slug: string;
    app: string;
  }>;
}

async function populateArchetypePages(): Promise<void> {
  const pagesDir = path.join(__dirname, '../generated/archetype-pages');
  
  if (!fs.existsSync(pagesDir)) {
    console.error('No generated pages found. Run: npx tsx scripts/generate-archetype-examples.ts --static');
    process.exit(1);
  }

  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} archetype page files`);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(pagesDir, file);
    const data: ArchetypePageData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    try {
      const result = await pool.query(
        `INSERT INTO archetype_pages (
          slug, archetype_id, archetype_name, archetype_description,
          dating_app, meta_title, meta_description, examples, related_pages
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (slug) DO UPDATE SET
          archetype_id = EXCLUDED.archetype_id,
          archetype_name = EXCLUDED.archetype_name,
          archetype_description = EXCLUDED.archetype_description,
          dating_app = EXCLUDED.dating_app,
          meta_title = EXCLUDED.meta_title,
          meta_description = EXCLUDED.meta_description,
          examples = EXCLUDED.examples,
          related_pages = EXCLUDED.related_pages
        RETURNING (xmax = 0) AS inserted`,
        [
          data.slug,
          data.archetype.id,
          data.archetype.name,
          data.archetype.description,
          data.app,
          data.meta.title,
          data.meta.description,
          JSON.stringify(data.examples),
          JSON.stringify(data.relatedPages),
        ]
      );

      if (result.rows[0].inserted) {
        inserted++;
      } else {
        updated++;
      }
    } catch (err) {
      console.error(`Error inserting ${file}:`, err);
      errors++;
    }
  }

  console.log(`\nResults:`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total: ${files.length}`);

  await pool.end();
}

async function verifyData(): Promise<void> {
  const result = await pool.query(`
    SELECT slug, archetype_name, dating_app, meta_title 
    FROM archetype_pages 
    ORDER BY archetype_name, dating_app
    LIMIT 10
  `);

  console.log('\nSample data:');
  console.table(result.rows);

  const countResult = await pool.query('SELECT COUNT(*) FROM archetype_pages');
  console.log(`\nTotal records in database: ${countResult.rows[0].count}`);

  await pool.end();
}

const args = process.argv.slice(2);

if (args.includes('--verify')) {
  verifyData().catch(console.error);
} else {
  populateArchetypePages().catch(console.error);
}
