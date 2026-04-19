import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, User, Timer, Gauge } from 'lucide-react';
import { api } from '../services/api';
import { generateTestPDF } from '../utils/pdf';
import LevelBadge from '../components/LevelBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function TestDetail() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.getTestById(id);
        setTest(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading test details..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!test) return <ErrorMessage message="Test not found" />;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/results"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Results
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {test.first_name} {test.last_name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Test #{test.id} · {new Date(test.created_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => generateTestPDF(test)}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <FileText className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {/* VMA Hero */}
      <div className="card text-center mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">VMA Result</p>
        <p className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-3">
          {test.vma} <span className="text-xl">km/h</span>
        </p>
        <LevelBadge level={test.level} label={test.level_label} />
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Athlete Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Athlete Information</h3>
          </div>
          <dl className="space-y-3">
            {[
              ['Name', `${test.first_name} ${test.last_name}`],
              ['Age', `${test.age} years`],
              ['Gender', test.gender.charAt(0).toUpperCase() + test.gender.slice(1)],
              ['Weight', test.weight ? `${test.weight} kg` : 'N/A'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Test Data */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Test Data</h3>
          </div>
          <dl className="space-y-3">
            {[
              ['Test Type', test.test_type === 'cooper' ? 'Cooper (12 min)' : 'Demi-Cooper (6 min)'],
              ['Distance', `${test.distance_meters} m`],
              ['Stop Time', `${test.stop_time_seconds} s`],
              ['Walking Time', `${test.walking_time_seconds} s`],
              ['Effective Time', `${test.effective_time_seconds} s`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Calculation Steps */}
      {test.calculation_steps && test.calculation_steps.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Calculation Steps</h3>
          </div>
          <div className="space-y-2">
            {test.calculation_steps.map((step, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
