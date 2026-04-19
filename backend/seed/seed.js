require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../src/config/db');
const { calculateVMA, classifyLevel } = require('../src/utils/vma');

const sampleData = [
  // Cooper tests
  { firstName: 'Alice', lastName: 'Martin', age: 25, gender: 'female', weight: 58, testType: 'cooper', distanceMeters: 2800, stopTimeSeconds: 30, walkingTimeSeconds: 60 },
  { firstName: 'Bob', lastName: 'Dupont', age: 30, gender: 'male', weight: 75, testType: 'cooper', distanceMeters: 3200, stopTimeSeconds: 10, walkingTimeSeconds: 20 },
  { firstName: 'Claire', lastName: 'Bernard', age: 22, gender: 'female', weight: 52, testType: 'cooper', distanceMeters: 2400, stopTimeSeconds: 60, walkingTimeSeconds: 120 },
  { firstName: 'David', lastName: 'Petit', age: 35, gender: 'male', weight: 82, testType: 'cooper', distanceMeters: 3500, stopTimeSeconds: 5, walkingTimeSeconds: 10 },
  { firstName: 'Emma', lastName: 'Robert', age: 28, gender: 'female', weight: 63, testType: 'cooper', distanceMeters: 2000, stopTimeSeconds: 90, walkingTimeSeconds: 150 },
  { firstName: 'François', lastName: 'Moreau', age: 40, gender: 'male', weight: 78, testType: 'cooper', distanceMeters: 3100, stopTimeSeconds: 20, walkingTimeSeconds: 40 },
  { firstName: 'Gabrielle', lastName: 'Laurent', age: 19, gender: 'female', weight: 55, testType: 'cooper', distanceMeters: 3400, stopTimeSeconds: 0, walkingTimeSeconds: 15 },

  // Demi-Cooper tests
  { firstName: 'Hugo', lastName: 'Simon', age: 24, gender: 'male', weight: 70, testType: 'demi-cooper', distanceMeters: 1800, stopTimeSeconds: 10, walkingTimeSeconds: 20 },
  { firstName: 'Isabelle', lastName: 'Michel', age: 33, gender: 'female', weight: 60, testType: 'demi-cooper', distanceMeters: 1200, stopTimeSeconds: 30, walkingTimeSeconds: 60 },
  { firstName: 'Jules', lastName: 'Garcia', age: 27, gender: 'male', weight: 73, testType: 'demi-cooper', distanceMeters: 1600, stopTimeSeconds: 5, walkingTimeSeconds: 10 },
  { firstName: 'Karen', lastName: 'David', age: 31, gender: 'female', weight: null, testType: 'demi-cooper', distanceMeters: 1400, stopTimeSeconds: 15, walkingTimeSeconds: 30 },
  { firstName: 'Lucas', lastName: 'Bertrand', age: 20, gender: 'male', weight: 68, testType: 'demi-cooper', distanceMeters: 2000, stopTimeSeconds: 0, walkingTimeSeconds: 5 },

  // Repeat athletes (for progression tracking)
  { firstName: 'Alice', lastName: 'Martin', age: 25, gender: 'female', weight: 57, testType: 'cooper', distanceMeters: 3000, stopTimeSeconds: 20, walkingTimeSeconds: 40 },
  { firstName: 'Bob', lastName: 'Dupont', age: 30, gender: 'male', weight: 74, testType: 'demi-cooper', distanceMeters: 1700, stopTimeSeconds: 5, walkingTimeSeconds: 15 },
  { firstName: 'David', lastName: 'Petit', age: 35, gender: 'male', weight: 81, testType: 'demi-cooper', distanceMeters: 1900, stopTimeSeconds: 0, walkingTimeSeconds: 10 },
];

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create table first
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tests (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
        gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
        weight DECIMAL(5,2),
        test_type VARCHAR(20) NOT NULL CHECK (test_type IN ('cooper', 'demi-cooper')),
        distance_meters DECIMAL(10,2) NOT NULL CHECK (distance_meters > 0),
        stop_time_seconds DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (stop_time_seconds >= 0),
        walking_time_seconds DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (walking_time_seconds >= 0),
        effective_time_seconds DECIMAL(10,2) NOT NULL,
        vma DECIMAL(6,2) NOT NULL,
        level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
        level_label VARCHAR(50) NOT NULL,
        calculation_steps TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await pool.query(createTableQuery);

    // Clear existing data
    await pool.query('DELETE FROM tests');
    console.log('🗑  Cleared existing data');

    for (const data of sampleData) {
      const result = calculateVMA({
        testType: data.testType,
        distanceMeters: data.distanceMeters,
        stopTimeSeconds: data.stopTimeSeconds,
        walkingTimeSeconds: data.walkingTimeSeconds,
      });

      const levelInfo = classifyLevel(result.vma);

      const query = `
        INSERT INTO tests (
          first_name, last_name, age, gender, weight,
          test_type, distance_meters, stop_time_seconds, walking_time_seconds,
          effective_time_seconds, vma, level, level_label, calculation_steps
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      `;

      await pool.query(query, [
        data.firstName, data.lastName, data.age, data.gender, data.weight,
        data.testType, data.distanceMeters, data.stopTimeSeconds, data.walkingTimeSeconds,
        result.effectiveTimeSeconds, result.vma, levelInfo.level, levelInfo.label, result.steps,
      ]);

      console.log(`  ✅ ${data.firstName} ${data.lastName} — VMA: ${result.vma} km/h (${levelInfo.label})`);
    }

    console.log(`\n🎉 Seeded ${sampleData.length} test results`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
