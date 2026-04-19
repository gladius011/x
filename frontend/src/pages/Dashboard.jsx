import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { Trophy, Users, TrendingUp, Target } from 'lucide-react';
import { api } from '../services/api';
import { LEVELS } from '../utils/vma';
import LevelBadge from '../components/LevelBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.getStats();
        setStats(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!stats) return <ErrorMessage message="No statistics available" />;

  const { overall, byLevel, byType, byGender, topRanking, progression } = stats;

  // Prepare chart data
  const levelChartData = LEVELS.map((l) => {
    const found = byLevel.find((s) => s.level === l.level);
    return {
      name: `L${l.level}`,
      label: l.label,
      count: found ? parseInt(found.count) : 0,
      avgVma: found ? parseFloat(found.avg_vma) : 0,
      color: l.color,
    };
  });

  const pieData = byType.map((t) => ({
    name: t.test_type === 'cooper' ? 'Cooper' : 'Demi-Cooper',
    value: parseInt(t.count),
    color: t.test_type === 'cooper' ? '#3b82f6' : '#8b5cf6',
  }));

  // Group progression data by athlete
  const athletes = {};
  progression.forEach((p) => {
    if (!athletes[p.athlete]) athletes[p.athlete] = [];
    athletes[p.athlete].push({
      date: new Date(p.created_at).toLocaleDateString(),
      vma: parseFloat(p.vma),
      type: p.test_type,
    });
  });

  // Only show athletes with 2+ tests for progression
  const progressionAthletes = Object.entries(athletes)
    .filter(([, tests]) => tests.length >= 2)
    .slice(0, 5);

  // Prepare line chart data
  let progressionChartData = [];
  if (progressionAthletes.length > 0) {
    const maxTests = Math.max(...progressionAthletes.map(([, t]) => t.length));
    for (let i = 0; i < maxTests; i++) {
      const point = { test: `Test ${i + 1}` };
      progressionAthletes.forEach(([name, tests]) => {
        if (tests[i]) point[name] = tests[i].vma;
      });
      progressionChartData.push(point);
    }
  }

  const lineColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Overview of VMA test results and statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Tests"
          value={overall.total_tests || 0}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-50 dark:bg-blue-900/30"
        />
        <StatCard
          icon={Target}
          label="Average VMA"
          value={`${overall.overall_avg_vma || 0} km/h`}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-green-50 dark:bg-green-900/30"
        />
        <StatCard
          icon={TrendingUp}
          label="Highest VMA"
          value={`${overall.max_vma || 0} km/h`}
          color="text-violet-600 dark:text-violet-400"
          bgColor="bg-violet-50 dark:bg-violet-900/30"
        />
        <StatCard
          icon={Trophy}
          label="Lowest VMA"
          value={`${overall.min_vma || 0} km/h`}
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-50 dark:bg-amber-900/30"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Level Distribution */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Athletes per Level</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [value, name === 'count' ? 'Athletes' : 'Avg VMA']}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Athletes" radius={[4, 4, 0, 0]}>
                {levelChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Test Type Distribution */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Test Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progression Chart */}
      {progressionChartData.length > 0 && (
        <div className="card mb-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            VMA Progression per Athlete
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="test" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit=" km/h" />
              <Tooltip />
              <Legend />
              {progressionAthletes.map(([name], i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={lineColors[i % lineColors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Average VMA per Level */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Average VMA per Level</h3>
          {byLevel.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
          ) : (
            <div className="space-y-3">
              {byLevel.map((s) => (
                <div key={s.level} className="flex items-center justify-between">
                  <LevelBadge level={s.level} label={s.level_label} />
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{s.avg_vma} km/h</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {s.count} athlete{s.count > 1 ? 's' : ''} · {s.min_vma}–{s.max_vma} km/h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Ranking */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top 10 Ranking
            </div>
          </h3>
          {topRanking.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
          ) : (
            <div className="space-y-2">
              {topRanking.map((t, i) => (
                <div key={t.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                          : i === 1
                          ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                          : i === 2
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {t.first_name} {t.last_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.test_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{t.vma} km/h</p>
                    <LevelBadge level={t.level} label={t.level_label} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gender Stats */}
      {byGender.length > 0 && (
        <div className="card mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Average VMA by Gender</h3>
          <div className="grid grid-cols-3 gap-4">
            {byGender.map((g) => (
              <div key={g.gender} className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {g.gender}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{g.avg_vma}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">km/h avg · {g.count} tests</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
