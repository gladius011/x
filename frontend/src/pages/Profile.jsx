import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, ClipboardList, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import LevelBadge from '../components/LevelBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Toast from '../components/Toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function fetchUserTests() {
      try {
        const res = await api.getUserTests({ limit: 10, sortBy: 'created_at', sortOrder: 'DESC' });
        setTests(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUserTests();
  }, []);

  const bestVMA = tests.length > 0
    ? tests.reduce((best, t) => (parseFloat(t.vma) > parseFloat(best.vma) ? t : best), tests[0])
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Profile card */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.username}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{user?.email}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Member since {new Date(user?.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={logout}
            className="btn-secondary text-sm"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <ClipboardList className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{tests.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Saved Tests</p>
        </div>
        <div className="card text-center">
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {bestVMA ? `${bestVMA.vma} km/h` : '—'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Best VMA</p>
        </div>
        <div className="card text-center">
          <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {tests.length > 0
              ? new Date(tests[0].created_at).toLocaleDateString()
              : '—'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Last Test</p>
        </div>
      </div>

      {/* Recent tests */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tests</h3>
          <Link to="/results" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            View all →
          </Link>
        </div>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && tests.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No tests saved yet</p>
            <Link to="/" className="btn-primary text-sm">
              Take a Test
            </Link>
          </div>
        )}

        {!loading && !error && tests.length > 0 && (
          <div className="space-y-3">
            {tests.slice(0, 5).map((test) => (
              <Link
                key={test.id}
                to={`/results/${test.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {test.first_name} {test.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {test.test_type === 'cooper' ? 'Cooper' : 'Demi-Cooper'} · {new Date(test.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {test.vma} km/h
                  </span>
                  <LevelBadge level={test.level} label={test.level_label} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
