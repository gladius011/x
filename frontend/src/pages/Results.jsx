import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, FileText, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { LEVELS } from '../utils/vma';
import { generateBulkPDF } from '../utils/pdf';
import LevelBadge from '../components/LevelBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Toast from '../components/Toast';

export default function Results() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  const fetchTests = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search.trim();
      if (filterLevel) params.level = filterLevel;
      if (filterType) params.type = filterType;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const response = await api.getTests(params);
      setTests(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterLevel, filterType, sortBy, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchTests(1), 300);
    return () => clearTimeout(debounce);
  }, [fetchTests]);

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this test result?')) return;
    try {
      await api.deleteTest(id);
      setToast({ message: 'Test deleted successfully', type: 'success' });
      fetchTests(pagination.page);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleExportCSV() {
    try {
      const params = {};
      if (filterLevel) params.level = filterLevel;
      if (filterType) params.type = filterType;
      if (search.trim()) params.search = search.trim();

      const csv = await api.exportCSV(params);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vma-results.csv';
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: 'CSV exported successfully', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  function handleExportPDF() {
    if (tests.length === 0) return;
    generateBulkPDF(tests);
    setToast({ message: 'PDF exported successfully', type: 'success' });
  }

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Results</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {pagination.total} total result{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="input-field pl-9"
            />
          </div>

          {/* Level filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="input-field"
          >
            <option value="">All Levels</option>
            {LEVELS.map((l) => (
              <option key={l.level} value={l.level}>
                Level {l.level} — {l.label}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="">All Test Types</option>
            <option value="cooper">Cooper (12 min)</option>
            <option value="demi-cooper">Demi-Cooper (6 min)</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by);
              setSortOrder(order);
            }}
            className="input-field"
          >
            <option value="created_at-DESC">Newest First</option>
            <option value="created_at-ASC">Oldest First</option>
            <option value="vma-DESC">Highest VMA</option>
            <option value="vma-ASC">Lowest VMA</option>
            <option value="last_name-ASC">Name A–Z</option>
            <option value="last_name-DESC">Name Z–A</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <LoadingSpinner message="Loading results..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchTests(1)} />
      ) : tests.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No test results found.</p>
          <Link to="/" className="btn-primary">
            Create First Test
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Athlete</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distance</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">VMA</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {test.first_name} {test.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {test.age}y · {test.gender}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${test.test_type === 'cooper' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'}`}>
                        {test.test_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-700 dark:text-gray-300">
                      {test.distance_meters} m
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{test.vma} km/h</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <LevelBadge level={test.level} label={test.level_label} />
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-gray-500 dark:text-gray-400">
                      {new Date(test.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/results/${test.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {tests.map((test) => (
              <div key={test.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {test.first_name} {test.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {test.age}y · {test.gender} · {test.test_type}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{test.vma} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <LevelBadge level={test.level} label={test.level_label} />
                  <div className="flex gap-1">
                    <Link to={`/results/${test.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(test.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchTests(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => fetchTests(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn-secondary flex items-center gap-1 text-sm disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
