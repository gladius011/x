import { Link } from 'react-router-dom';
import { Timer, Zap, ArrowRight } from 'lucide-react';

export default function TestSelection() {
  const tests = [
    {
      type: 'cooper',
      title: 'Cooper Test',
      duration: '12 minutes',
      description:
        'The classic Cooper test measures aerobic fitness by recording the maximum distance covered in 12 minutes of running.',
      icon: Timer,
      color: 'from-blue-500 to-blue-700',
      hoverColor: 'hover:from-blue-600 hover:to-blue-800',
      features: ['12-minute endurance test', 'Standard VMA assessment', 'Suitable for all fitness levels'],
    },
    {
      type: 'demi-cooper',
      title: 'Demi-Cooper Test',
      duration: '6 minutes',
      description:
        'A shorter variation of the Cooper test, lasting 6 minutes. Ideal for quick assessments or athletes who prefer a more intense, shorter effort.',
      icon: Zap,
      color: 'from-violet-500 to-violet-700',
      hoverColor: 'hover:from-violet-600 hover:to-violet-800',
      features: ['6-minute sprint test', 'Quick VMA estimate', 'Higher intensity effort'],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Calculate Your VMA
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose a test type to calculate your Vitesse Maximale Aérobie (Maximum Aerobic Speed).
          Your VMA helps determine your fitness level and personalize your training zones.
        </p>
      </div>

      {/* Test Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {tests.map(({ type, title, duration, description, icon: Icon, color, hoverColor, features }) => (
          <Link
            key={type}
            to={`/test/${type}`}
            className="group card hover:shadow-md transition-all duration-300 overflow-hidden relative"
          >
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${color} ${hoverColor} -mx-6 -mt-6 px-6 py-8 mb-6 transition-all`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="text-white/80 text-sm">{duration}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>

            <ul className="space-y-2 mb-6">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:gap-3 transition-all">
              Start Test <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Info section */}
      <div className="mt-12 card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          What is VMA?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          <strong>VMA (Vitesse Maximale Aérobie)</strong> is the minimum running speed at which your body
          reaches its maximum oxygen consumption (VO₂max). It is a key indicator of aerobic fitness and is
          used to define training intensities. A higher VMA indicates better cardiovascular endurance. The
          test accounts for your effective running time by subtracting any stops or walking periods.
        </p>
      </div>
    </div>
  );
}
