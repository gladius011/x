const TestModel = require('../models/testModel');
const { validateInputs, calculateVMA, classifyLevel } = require('../utils/vma');

const testController = {
  /**
   * POST /api/tests - Create a new test result (authenticated users only save to DB)
   * Also used as POST /api/tests/calculate for guest calculations (no save)
   */
  async create(req, res, next) {
    try {
      const {
        firstName, lastName, age, gender, weight,
        testType, distanceMeters, stopTimeSeconds, walkingTimeSeconds,
      } = req.body;

      // Validate VMA calculation inputs
      const validation = validateInputs({
        testType,
        distanceMeters,
        stopTimeSeconds,
        walkingTimeSeconds,
      });

      if (!validation.valid) {
        return res.status(400).json({ success: false, errors: validation.errors });
      }

      // Calculate VMA
      const result = calculateVMA({
        testType,
        distanceMeters,
        stopTimeSeconds,
        walkingTimeSeconds,
      });

      // Classify level
      const levelInfo = classifyLevel(result.vma);

      // If user is authenticated, save to DB
      if (req.user) {
        const saved = await TestModel.create({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          age,
          gender,
          weight,
          testType,
          distanceMeters,
          stopTimeSeconds,
          walkingTimeSeconds,
          effectiveTimeSeconds: result.effectiveTimeSeconds,
          vma: result.vma,
          level: levelInfo.level,
          levelLabel: levelInfo.label,
          calculationSteps: result.steps,
          userId: req.user.id,
        });

        return res.status(201).json({
          success: true,
          saved: true,
          data: {
            ...saved,
            calculationSteps: result.steps,
            levelColor: levelInfo.color,
          },
        });
      }

      // Guest: return calculation only, not saved
      res.json({
        success: true,
        saved: false,
        message: 'Sign up to save your results!',
        data: {
          vma: result.vma,
          effectiveTimeSeconds: result.effectiveTimeSeconds,
          level: levelInfo.level,
          levelLabel: levelInfo.label,
          levelColor: levelInfo.color,
          calculationSteps: result.steps,
          // Echo back the input for display
          first_name: firstName,
          last_name: lastName,
          age,
          gender,
          test_type: testType,
          distance_meters: distanceMeters,
          stop_time_seconds: stopTimeSeconds,
          walking_time_seconds: walkingTimeSeconds,
          effective_time_seconds: result.effectiveTimeSeconds,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tests - Get logged-in user's tests with optional filters
   */
  async getAll(req, res, next) {
    try {
      const { level, type, search, sortBy, sortOrder, page = 1, limit = 50 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const [tests, total] = await Promise.all([
        TestModel.findByUserId(req.user.id, {
          level, type, search, sortBy, sortOrder,
          limit: parseInt(limit),
          offset,
        }),
        TestModel.countByUserId(req.user.id, { level, type, search }),
      ]);

      res.json({
        success: true,
        data: tests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tests/export/csv - Export logged-in user's tests as CSV
   */
  async exportCSV(req, res, next) {
    try {
      const { Parser } = require('json2csv');
      const { level, type, search } = req.query;

      const tests = await TestModel.findByUserId(req.user.id, {
        level, type, search,
        sortBy: 'created_at', sortOrder: 'DESC',
        limit: 10000, offset: 0,
      });

      const fields = [
        { label: 'ID', value: 'id' },
        { label: 'First Name', value: 'first_name' },
        { label: 'Last Name', value: 'last_name' },
        { label: 'Age', value: 'age' },
        { label: 'Gender', value: 'gender' },
        { label: 'Weight (kg)', value: 'weight' },
        { label: 'Test Type', value: 'test_type' },
        { label: 'Distance (m)', value: 'distance_meters' },
        { label: 'Stop Time (s)', value: 'stop_time_seconds' },
        { label: 'Walking Time (s)', value: 'walking_time_seconds' },
        { label: 'Effective Time (s)', value: 'effective_time_seconds' },
        { label: 'VMA (km/h)', value: 'vma' },
        { label: 'Level', value: 'level' },
        { label: 'Level Label', value: 'level_label' },
        { label: 'Date', value: 'created_at' },
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(tests);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=vma-results.csv');
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tests/:id - Get single test (only if owned by logged-in user)
   */
  async getById(req, res, next) {
    try {
      const test = await TestModel.findById(req.params.id);
      if (!test) {
        return res.status(404).json({ success: false, error: 'Test not found' });
      }
      if (test.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      res.json({ success: true, data: test });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/tests/:id - Delete a test (only if owned by logged-in user)
   */
  async delete(req, res, next) {
    try {
      const test = await TestModel.findById(req.params.id);
      if (!test) {
        return res.status(404).json({ success: false, error: 'Test not found' });
      }
      if (test.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      const deleted = await TestModel.delete(req.params.id);
      res.json({ success: true, data: deleted });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/stats - Get statistics for logged-in user's tests
   */
  async getStats(req, res, next) {
    try {
      const stats = await TestModel.getStatsByUserId(req.user.id);
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/users/tests - Get logged-in user's saved tests
   */
  async getUserTests(req, res, next) {
    try {
      const { level, type, search, sortBy, sortOrder, page = 1, limit = 50 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const [tests, total] = await Promise.all([
        TestModel.findByUserId(req.user.id, {
          level, type, search, sortBy, sortOrder,
          limit: parseInt(limit),
          offset,
        }),
        TestModel.countByUserId(req.user.id, { level, type, search }),
      ]);

      res.json({
        success: true,
        data: tests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = testController;
