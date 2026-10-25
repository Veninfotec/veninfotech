import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('Running database migrations...');
    
    // Create post_views table
    await sql`
      CREATE TABLE IF NOT EXISTS post_views (
        slug VARCHAR(255) PRIMARY KEY,
        view_count INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Created/verified post_views table');

    // Create posts table for dynamic blogs & articles
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        category VARCHAR(100) NOT NULL DEFAULT 'TECH',
        image VARCHAR(1000) NOT NULL DEFAULT '',
        status VARCHAR(20) NOT NULL DEFAULT 'published',
        author VARCHAR(100) NOT NULL DEFAULT 'Editorial Team',
        is_breaking BOOLEAN DEFAULT FALSE,
        views INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_breaking BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type VARCHAR(20) DEFAULT 'blog';`;
    console.log('✓ Created/verified posts table with is_breaking and post_type columns');

    // Create newsletter_subscribers table for monetization / audience capture
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Created/verified newsletter_subscribers table');

    // Seed default view count for existing hello-world post if not exists
    await sql`
      INSERT INTO post_views (slug, view_count)
      VALUES ('hello-world', 1)
      ON CONFLICT (slug) DO NOTHING;
    `;
    console.log('✓ Seeded initial post view count');

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Current public tables:', tables.map(t => t.table_name));

    const views = await sql`SELECT * FROM post_views`;
    console.log('post_views records:', views);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
