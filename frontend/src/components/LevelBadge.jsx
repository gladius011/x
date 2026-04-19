import { getLevelBadgeClass } from '../utils/vma';

export default function LevelBadge({ level, label }) {
  return (
    <span className={`badge ${getLevelBadgeClass(level)}`}>
      Level {level} — {label}
    </span>
  );
}
