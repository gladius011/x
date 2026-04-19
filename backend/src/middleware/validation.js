/**
 * Validation middleware for test submission
 */
function validateTestInput(req, res, next) {
  const errors = [];
  const { firstName, lastName, age, gender, testType, distanceMeters, stopTimeSeconds, walkingTimeSeconds } = req.body;

  // Runner info
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
    errors.push('First name is required.');
  }
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
    errors.push('Last name is required.');
  }
  if (!age || typeof age !== 'number' || age <= 0 || age >= 150 || !Number.isInteger(age)) {
    errors.push('Age must be a positive integer between 1 and 149.');
  }
  if (!gender || !['male', 'female', 'other'].includes(gender)) {
    errors.push('Gender must be "male", "female", or "other".');
  }

  // Weight is optional but must be positive if provided
  if (req.body.weight !== undefined && req.body.weight !== null) {
    if (typeof req.body.weight !== 'number' || req.body.weight <= 0) {
      errors.push('Weight must be a positive number (kg).');
    }
  }

  // Test type
  if (!testType || !['cooper', 'demi-cooper'].includes(testType)) {
    errors.push('Test type must be "cooper" or "demi-cooper".');
  }

  // Distance
  if (distanceMeters === undefined || distanceMeters === null || typeof distanceMeters !== 'number' || distanceMeters <= 0) {
    errors.push('Distance must be a positive number (meters).');
  }

  // Stop time
  if (stopTimeSeconds === undefined || stopTimeSeconds === null || typeof stopTimeSeconds !== 'number' || stopTimeSeconds < 0) {
    errors.push('Stop time must be a non-negative number (seconds).');
  }

  // Walking time
  if (walkingTimeSeconds === undefined || walkingTimeSeconds === null || typeof walkingTimeSeconds !== 'number' || walkingTimeSeconds < 0) {
    errors.push('Walking time must be a non-negative number (seconds).');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

module.exports = { validateTestInput };
