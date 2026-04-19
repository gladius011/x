/**
 * Frontend VMA calculation utility (mirrors backend)
 */

export const TEST_DURATIONS = {
  cooper: 720,
  'demi-cooper': 360,
};

export function calculateVMA({ testType, distanceMeters, stopTimeSeconds, walkingTimeSeconds }) {
  const totalTestTime = TEST_DURATIONS[testType];
  if (!totalTestTime) return null;

  const effectiveTimeSeconds = totalTestTime - stopTimeSeconds - walkingTimeSeconds;
  if (effectiveTimeSeconds <= 0) return { vma: 0, effectiveTimeSeconds: 0 };

  const effectiveTimeHours = effectiveTimeSeconds / 3600;
  const distanceKm = distanceMeters / 1000;
  const vma = Math.round((distanceKm / effectiveTimeHours) * 100) / 100;

  return { vma, effectiveTimeSeconds, effectiveTimeHours };
}

export function classifyLevel(vma) {
  if (vma < 10) return { level: 1, label: 'Beginner', color: '#ef4444' };
  if (vma < 12) return { level: 2, label: 'Intermediate', color: '#f59e0b' };
  if (vma < 14) return { level: 3, label: 'Good', color: '#3b82f6' };
  if (vma < 16) return { level: 4, label: 'Very Good', color: '#8b5cf6' };
  return { level: 5, label: 'Excellent', color: '#10b981' };
}

export const LEVELS = [
  { level: 1, label: 'Beginner', min: 0, max: 10, color: '#ef4444', bgClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { level: 2, label: 'Intermediate', min: 10, max: 12, color: '#f59e0b', bgClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  { level: 3, label: 'Good', min: 12, max: 14, color: '#3b82f6', bgClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { level: 4, label: 'Very Good', min: 14, max: 16, color: '#8b5cf6', bgClass: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' },
  { level: 5, label: 'Excellent', min: 16, max: null, color: '#10b981', bgClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
];

export function getLevelBadgeClass(level) {
  const found = LEVELS.find((l) => l.level === level);
  return found?.bgClass || 'bg-gray-100 text-gray-800';
}

export function validateForm(data) {
  const errors = {};
  if (!data.firstName?.trim()) errors.firstName = 'First name is required';
  if (!data.lastName?.trim()) errors.lastName = 'Last name is required';
  if (!data.age || data.age <= 0 || data.age >= 150) errors.age = 'Valid age is required (1-149)';
  if (!data.gender) errors.gender = 'Gender is required';
  if (!data.testType) errors.testType = 'Test type is required';
  if (!data.distanceMeters || data.distanceMeters <= 0) errors.distanceMeters = 'Distance must be positive';
  if (data.stopTimeSeconds < 0) errors.stopTimeSeconds = 'Cannot be negative';
  if (data.walkingTimeSeconds < 0) errors.walkingTimeSeconds = 'Cannot be negative';

  const totalTime = TEST_DURATIONS[data.testType] || 0;
  if (totalTime && (data.stopTimeSeconds + data.walkingTimeSeconds) >= totalTime) {
    errors.stopTimeSeconds = `Stop + walking time must be less than ${totalTime}s`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
