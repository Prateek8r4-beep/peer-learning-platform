require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runSeeds() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🌱 Seeding database...');

    // Load subjects
    const subjectsFile = path.join(__dirname, 'subjects.json');
    const subjects = JSON.parse(fs.readFileSync(subjectsFile, 'utf8'));

    // Insert subjects
    for (const subject of subjects) {
      await pool.query(
        `INSERT INTO subjects (name, category, description, icon_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO NOTHING`,
        [subject.name, subject.category, subject.description, subject.icon_url]
      );
    }

    console.log(`✅ Seeded ${subjects.length} subjects`);
    console.log('✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeeds();
