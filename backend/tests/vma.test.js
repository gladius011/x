import { describe, it, expect } from 'vitest';
const { validateInputs, calculateVMA, classifyLevel, getAllLevels, TEST_DURATIONS } = require('../src/utils/vma');

describe('TEST_DURATIONS', () => {
  it('should have cooper = 720 seconds', () => {
    expect(TEST_DURATIONS.cooper).toBe(720);
  });

  it('should have demi-cooper = 360 seconds', () => {
    expect(TEST_DURATIONS['demi-cooper']).toBe(360);
  });
});

describe('validateInputs', () => {
  const validInput = {
    testType: 'cooper',
    distanceMeters: 3000,
    stopTimeSeconds: 30,
    walkingTimeSeconds: 60,
  };

  it('should pass with valid inputs', () => {
    const result = validateInputs(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail with invalid test type', () => {
    const result = validateInputs({ ...validInput, testType: 'marathon' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Invalid test type');
  });

  it('should fail with negative distance', () => {
    const result = validateInputs({ ...validInput, distanceMeters: -100 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Distance must be a positive number (meters).');
  });

  it('should fail with zero distance', () => {
    const result = validateInputs({ ...validInput, distanceMeters: 0 });
    expect(result.valid).toBe(false);
  });

  it('should fail with negative stop time', () => {
    const result = validateInputs({ ...validInput, stopTimeSeconds: -10 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Stop time cannot be negative.');
  });

  it('should fail with negative walking time', () => {
    const result = validateInputs({ ...validInput, walkingTimeSeconds: -5 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Walking time cannot be negative.');
  });

  it('should fail when stop + walk time equals total test time', () => {
    const result = validateInputs({
      ...validInput,
      stopTimeSeconds: 360,
      walkingTimeSeconds: 360,
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('must be less than total test time');
  });

  it('should fail when stop + walk time exceeds total test time', () => {
    const result = validateInputs({
      ...validInput,
      stopTimeSeconds: 400,
      walkingTimeSeconds: 400,
    });
    expect(result.valid).toBe(false);
  });

  it('should pass when stop + walk time is exactly 1 less than total time', () => {
    const result = validateInputs({
      ...validInput,
      stopTimeSeconds: 359,
      walkingTimeSeconds: 360,
    });
    expect(result.valid).toBe(true);
  });

  it('should fail with missing distance', () => {
    const result = validateInputs({ ...validInput, distanceMeters: undefined });
    expect(result.valid).toBe(false);
  });

  it('should collect multiple errors at once', () => {
    const result = validateInputs({
      testType: 'invalid',
      distanceMeters: -1,
      stopTimeSeconds: -1,
      walkingTimeSeconds: -1,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe('calculateVMA', () => {
  it('should calculate VMA correctly for Cooper test', () => {
    const result = calculateVMA({
      testType: 'cooper',
      distanceMeters: 3000,
      stopTimeSeconds: 0,
      walkingTimeSeconds: 0,
    });
    // VMA = 3 km / (720/3600) h = 3 / 0.2 = 15 km/h
    expect(result.vma).toBe(15);
    expect(result.effectiveTimeSeconds).toBe(720);
  });

  it('should calculate VMA correctly for Demi-Cooper test', () => {
    const result = calculateVMA({
      testType: 'demi-cooper',
      distanceMeters: 1500,
      stopTimeSeconds: 0,
      walkingTimeSeconds: 0,
    });
    // VMA = 1.5 km / (360/3600) h = 1.5 / 0.1 = 15 km/h
    expect(result.vma).toBe(15);
    expect(result.effectiveTimeSeconds).toBe(360);
  });

  it('should subtract stop and walking time', () => {
    const result = calculateVMA({
      testType: 'cooper',
      distanceMeters: 3000,
      stopTimeSeconds: 120,
      walkingTimeSeconds: 60,
    });
    // Effective time = 720 - 120 - 60 = 540s = 0.15h
    // VMA = 3 / 0.15 = 20 km/h
    expect(result.effectiveTimeSeconds).toBe(540);
    expect(result.vma).toBe(20);
  });

  it('should round VMA to 2 decimal places', () => {
    const result = calculateVMA({
      testType: 'cooper',
      distanceMeters: 2500,
      stopTimeSeconds: 30,
      walkingTimeSeconds: 30,
    });
    // Effective time = 720 - 30 - 30 = 660s = 0.183333h
    // VMA = 2.5 / 0.183333 = 13.636363...
    expect(result.vma).toBe(13.64);
  });

  it('should return 0 VMA when effective time is 0', () => {
    const result = calculateVMA({
      testType: 'demi-cooper',
      distanceMeters: 1500,
      stopTimeSeconds: 180,
      walkingTimeSeconds: 180,
    });
    expect(result.vma).toBe(0);
    expect(result.effectiveTimeSeconds).toBe(0);
  });

  it('should return 0 VMA when effective time is negative', () => {
    const result = calculateVMA({
      testType: 'demi-cooper',
      distanceMeters: 1500,
      stopTimeSeconds: 200,
      walkingTimeSeconds: 200,
    });
    expect(result.vma).toBe(0);
  });

  it('should log calculation steps', () => {
    const result = calculateVMA({
      testType: 'cooper',
      distanceMeters: 3000,
      stopTimeSeconds: 0,
      walkingTimeSeconds: 0,
    });
    expect(result.steps).toBeDefined();
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0]).toContain('cooper');
  });
});

describe('classifyLevel', () => {
  it('should classify < 10 as Beginner (Level 1)', () => {
    expect(classifyLevel(8).level).toBe(1);
    expect(classifyLevel(8).label).toBe('Beginner');
  });

  it('should classify 10 as Intermediate (Level 2)', () => {
    expect(classifyLevel(10).level).toBe(2);
    expect(classifyLevel(10).label).toBe('Intermediate');
  });

  it('should classify 11.5 as Intermediate (Level 2)', () => {
    expect(classifyLevel(11.5).level).toBe(2);
  });

  it('should classify 12 as Good (Level 3)', () => {
    expect(classifyLevel(12).level).toBe(3);
    expect(classifyLevel(12).label).toBe('Good');
  });

  it('should classify 14 as Very Good (Level 4)', () => {
    expect(classifyLevel(14).level).toBe(4);
    expect(classifyLevel(14).label).toBe('Very Good');
  });

  it('should classify 16 as Excellent (Level 5)', () => {
    expect(classifyLevel(16).level).toBe(5);
    expect(classifyLevel(16).label).toBe('Excellent');
  });

  it('should classify 20 as Excellent (Level 5)', () => {
    expect(classifyLevel(20).level).toBe(5);
  });

  it('should classify 0 as Beginner (Level 1)', () => {
    expect(classifyLevel(0).level).toBe(1);
  });

  it('should return a color for each level', () => {
    for (let vma = 5; vma <= 20; vma += 2) {
      const result = classifyLevel(vma);
      expect(result.color).toBeDefined();
      expect(result.color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('getAllLevels', () => {
  it('should return 5 levels', () => {
    expect(getAllLevels()).toHaveLength(5);
  });

  it('should have level 5 with max = null', () => {
    const levels = getAllLevels();
    expect(levels[4].max).toBeNull();
  });

  it('should have contiguous ranges', () => {
    const levels = getAllLevels();
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i].min).toBe(levels[i - 1].max);
    }
  });
});
