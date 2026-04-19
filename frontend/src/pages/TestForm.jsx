import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calculator, CheckCircle2, Info, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { validateForm, calculateVMA, classifyLevel, TEST_DURATIONS } from '../utils/vma';
import LevelBadge from '../components/LevelBadge';
import Toast from '../components/Toast';

const initialFormState = {
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
  weight: '',
  distanceMeters: '',
  stopTimeSeconds: '',
  walkingTimeSeconds: '',
};

export default function TestForm() {
  const { testType } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [preview, setPreview] = useState(null);

  const isCooper = testType === 'cooper';
  const testLabel = isCooper ? 'Cooper Test (12 min)' : 'Demi-Cooper Test (6 min)';
  const totalTime = TEST_DURATIONS[testType] || 0;

  function handleChange(e) {
    const { name, value } = e.target;
    const numericFields = ['age', 'weight', 'distanceMeters', 'stopTimeSeconds', 'walkingTimeSeconds'];

    const newForm = {
      ...form,
      [name]: numericFields.includes(name) ? (value === '' ? '' : Number(value)) : value,
    };
    setForm(newForm);

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Live VMA preview
    if (newForm.distanceMeters > 0 && newForm.stopTimeSeconds >= 0 && newForm.walkingTimeSeconds >= 0) {
      const previewResult = calculateVMA({
        testType,
        distanceMeters: Number(newForm.distanceMeters) || 0,
        stopTimeSeconds: Number(newForm.stopTimeSeconds) || 0,
        walkingTimeSeconds: Number(newForm.walkingTimeSeconds) || 0,
      });
      if (previewResult && previewResult.vma > 0) {
        setPreview({
          vma: previewResult.vma,
          ...classifyLevel(previewResult.vma),
        });
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const data = {
      ...form,
      testType,
      age: Number(form.age),
      weight: form.weight ? Number(form.weight) : null,
      distanceMeters: Number(form.distanceMeters),
      stopTimeSeconds: Number(form.stopTimeSeconds) || 0,
      walkingTimeSeconds: Number(form.walkingTimeSeconds) || 0,
    };

    const validation = validateForm(data);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const response = await api.createTest(data);
      setResult({ ...response.data, saved: response.data.saved !== false });
      setToast({
        message: response.data.saved !== false
          ? 'Test result saved successfully!'
          : 'VMA calculated! Sign up to save your results.',
        type: 'success',
      });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(initialFormState);
    setResult(null);
    setErrors({});
    setPreview(null);
  }

  // Show result after successful submission
  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Test Completed!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {result.first_name} {result.last_name}'s VMA has been calculated{result.saved ? ' and saved' : ''}.
          </p>

          {/* VMA Result */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">VMA Result</p>
            <p className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {result.vma} <span className="text-xl">km/h</span>
            </p>
            <LevelBadge level={result.level} label={result.level_label} />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-500 dark:text-gray-400">Distance</p>
              <p className="font-semibold text-gray-900 dark:text-white">{result.distance_meters} m</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-500 dark:text-gray-400">Effective Time</p>
              <p className="font-semibold text-gray-900 dark:text-white">{result.effective_time_seconds} s</p>
            </div>
          </div>

          {/* Calculation Steps */}
          {result.calculationSteps && (
            <details className="text-left mb-6">
              <summary className="cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                View calculation steps
              </summary>
              <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                {result.calculationSteps.map((step, i) => (
                  <p key={i} className="text-xs text-gray-600 dark:text-gray-400 font-mono mb-1">
                    {step}
                  </p>
                ))}
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {!result.saved && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-2">
                <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
                  <UserPlus className="w-5 h-5" />
                  <p className="text-sm font-medium">Sign up to save your results!</p>
                </div>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 ml-7">
                  Create an account to keep track of all your VMA tests over time.
                </p>
                <div className="flex gap-2 mt-3 ml-7">
                  <Link to="/signup" className="btn-primary text-sm">
                    Sign Up
                  </Link>
                  <Link to="/login" className="btn-secondary text-sm">
                    Log In
                  </Link>
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={handleReset} className="btn-primary">
                New Test
              </button>
              {result.saved && result.id && (
                <Link to={`/results/${result.id}`} className="btn-secondary">
                  View Details
                </Link>
              )}
              {result.saved && (
                <Link to="/results" className="btn-secondary">
                  All Results
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Choose a different test
      </Link>

      {/* Form header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{testLabel}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Total test time: <strong>{totalTime} seconds</strong> ({totalTime / 60} minutes)
        </p>
      </div>

      {/* Live preview */}
      {preview && (
        <div className="card mb-6 border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Preview</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {preview.vma} km/h
              </span>
              <LevelBadge level={preview.level} label={preview.label} />
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Runner Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Runner Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="label">First Name *</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                className={`input-field ${errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. Alice"
              />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="label">Last Name *</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                className={`input-field ${errors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. Martin"
              />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label htmlFor="age" className="label">Age *</label>
              <input
                id="age"
                name="age"
                type="number"
                min="1"
                max="149"
                value={form.age}
                onChange={handleChange}
                className={`input-field ${errors.age ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. 25"
              />
              {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
            </div>

            <div>
              <label htmlFor="gender" className="label">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={`input-field ${errors.gender ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="weight" className="label">Weight (kg) <span className="text-gray-400">— optional</span></label>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                min="0"
                value={form.weight}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. 68"
              />
            </div>
          </div>
        </div>

        {/* Performance Data */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Data
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="distanceMeters" className="label">Total Distance Covered (meters) *</label>
              <input
                id="distanceMeters"
                name="distanceMeters"
                type="number"
                step="1"
                min="1"
                value={form.distanceMeters}
                onChange={handleChange}
                className={`input-field ${errors.distanceMeters ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. 3000"
              />
              {errors.distanceMeters && <p className="text-xs text-red-500 mt-1">{errors.distanceMeters}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="stopTimeSeconds" className="label">Total Stop Time (seconds)</label>
                <input
                  id="stopTimeSeconds"
                  name="stopTimeSeconds"
                  type="number"
                  step="1"
                  min="0"
                  value={form.stopTimeSeconds}
                  onChange={handleChange}
                  className={`input-field ${errors.stopTimeSeconds ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="e.g. 30"
                />
                {errors.stopTimeSeconds && <p className="text-xs text-red-500 mt-1">{errors.stopTimeSeconds}</p>}
              </div>

              <div>
                <label htmlFor="walkingTimeSeconds" className="label">Total Walking Time (seconds)</label>
                <input
                  id="walkingTimeSeconds"
                  name="walkingTimeSeconds"
                  type="number"
                  step="1"
                  min="0"
                  value={form.walkingTimeSeconds}
                  onChange={handleChange}
                  className={`input-field ${errors.walkingTimeSeconds ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="e.g. 60"
                />
                {errors.walkingTimeSeconds && <p className="text-xs text-red-500 mt-1">{errors.walkingTimeSeconds}</p>}
              </div>
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-xs">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Effective running time</strong> = Total test time ({totalTime}s) − stop time − walking time.
                The stop + walking time must be less than {totalTime}s.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            {submitting ? 'Calculating...' : isAuthenticated ? 'Calculate VMA & Save' : 'Calculate VMA'}
          </button>
          <button type="button" onClick={handleReset} className="btn-secondary">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
