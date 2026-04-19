/**
 * VMA Calculation Utility
 *
 * Calculates Vitesse Maximale Aérobie (VMA) from Cooper and Demi-Cooper tests.
 *
 * Formulas:
 *   Total Time: Cooper = 720s (12 min), Demi-Cooper = 360s (6 min)
 *   Effective Time (s) = Total Test Time – Stop Time – Walking Time
 *   Effective Time (h) = Effective Time (s) / 3600
 *   VMA (km/h) = (Distance in meters / 1000) / Effective Time (h)
 */

const TEST_DURATIONS = {
  cooper: 720,        // 12 minutes in seconds
  'demi-cooper': 360, // 6 minutes in seconds
};

/**
 * Validate inputs for VMA calculation
 * @param {object} params
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateInputs({ testType, distanceMeters, stopTimeSeconds, walkingTimeSeconds }) {
  const errors = [];

  // Test type
  if (!testType || !TEST_DURATIONS[testType]) {
    errors.push(`Invalid test type: "${testType}". Must be "cooper" or "demi-cooper".`);
  }

  // Distance
  if (distanceMeters === undefined || distanceMeters === null) {
    errors.push('Distance is required.');
  } else if (typeof distanceMeters !== 'number' || distanceMeters <= 0) {
    errors.push('Distance must be a positive number (meters).');
  }

  // Stop time
  if (stopTimeSeconds === undefined || stopTimeSeconds === null) {
    errors.push('Stop time is required.');
  } else if (typeof stopTimeSeconds !== 'number' || stopTimeSeconds < 0) {
    errors.push('Stop time cannot be negative.');
  }

  // Walking time
  if (walkingTimeSeconds === undefined || walkingTimeSeconds === null) {
    errors.push('Walking time is required.');
  } else if (typeof walkingTimeSeconds !== 'number' || walkingTimeSeconds < 0) {
    errors.push('Walking time cannot be negative.');
  }

  // Combined time validation
  if (testType && TEST_DURATIONS[testType] && typeof stopTimeSeconds === 'number' && typeof walkingTimeSeconds === 'number') {
    const totalTestTime = TEST_DURATIONS[testType];
    const combinedInactiveTime = stopTimeSeconds + walkingTimeSeconds;

    if (combinedInactiveTime >= totalTestTime) {
      errors.push(
        `Stop time (${stopTimeSeconds}s) + walking time (${walkingTimeSeconds}s) = ${combinedInactiveTime}s ` +
        `must be less than total test time (${totalTestTime}s).`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate VMA with full transparency logging
 * @param {object} params
 * @returns {{ vma: number, effectiveTimeSeconds: number, effectiveTimeHours: number, steps: string[] }}
 */
function calculateVMA({ testType, distanceMeters, stopTimeSeconds, walkingTimeSeconds }) {
  const steps = [];
  const totalTestTime = TEST_DURATIONS[testType];

  steps.push(`1. Test type: ${testType} → Total test time = ${totalTestTime}s (${totalTestTime / 60} min)`);

  // Effective running time
  const effectiveTimeSeconds = totalTestTime - stopTimeSeconds - walkingTimeSeconds;
  steps.push(
    `2. Effective time = ${totalTestTime}s − ${stopTimeSeconds}s (stop) − ${walkingTimeSeconds}s (walk) = ${effectiveTimeSeconds}s`
  );

  if (effectiveTimeSeconds <= 0) {
    steps.push('❌ Effective time is ≤ 0. Cannot calculate VMA.');
    return { vma: 0, effectiveTimeSeconds: 0, effectiveTimeHours: 0, steps };
  }

  // Convert to hours
  const effectiveTimeHours = effectiveTimeSeconds / 3600;
  steps.push(`3. Effective time in hours = ${effectiveTimeSeconds} / 3600 = ${effectiveTimeHours.toFixed(6)} h`);

  // Distance in km
  const distanceKm = distanceMeters / 1000;
  steps.push(`4. Distance = ${distanceMeters}m = ${distanceKm} km`);

  // VMA
  const vmaRaw = distanceKm / effectiveTimeHours;
  const vma = Math.round(vmaRaw * 100) / 100; // Round to 2 decimal places
  steps.push(`5. VMA = ${distanceKm} km / ${effectiveTimeHours.toFixed(6)} h = ${vmaRaw.toFixed(6)} km/h`);
  steps.push(`6. VMA (rounded) = ${vma} km/h`);

  return { vma, effectiveTimeSeconds, effectiveTimeHours, steps };
}

/**
 * Classify VMA into a performance level
 * @param {number} vma - VMA in km/h
 * @returns {{ level: number, label: string, color: string }}
 */
function classifyLevel(vma) {
  if (vma < 10) return { level: 1, label: 'Beginner', color: '#ef4444' };
  if (vma < 12) return { level: 2, label: 'Intermediate', color: '#f59e0b' };
  if (vma < 14) return { level: 3, label: 'Good', color: '#3b82f6' };
  if (vma < 16) return { level: 4, label: 'Very Good', color: '#8b5cf6' };
  return { level: 5, label: 'Excellent', color: '#10b981' };
}

/**
 * Get all level definitions
 * @returns {Array<{ level: number, label: string, min: number, max: number|null, color: string }>}
 */
function getAllLevels() {
  return [
    { level: 1, label: 'Beginner', min: 0, max: 10, color: '#ef4444' },
    { level: 2, label: 'Intermediate', min: 10, max: 12, color: '#f59e0b' },
    { level: 3, label: 'Good', min: 12, max: 14, color: '#3b82f6' },
    { level: 4, label: 'Very Good', min: 14, max: 16, color: '#8b5cf6' },
    { level: 5, label: 'Excellent', min: 16, max: null, color: '#10b981' },
  ];
}

module.exports = {
  TEST_DURATIONS,
  validateInputs,
  calculateVMA,
  classifyLevel,
  getAllLevels,
};
