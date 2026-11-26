import {
  Bot,
  Briefcase,
  Code2,
  Compass,
  Cpu,
  FlaskConical,
  Megaphone,
  Palette,
} from 'lucide-react';
import type { Discipline } from '../../data/mock';

const ICON_MAP = {
  cpu: Cpu,
  code: Code2,
  bot: Bot,
  briefcase: Briefcase,
  palette: Palette,
  megaphone: Megaphone,
  compass: Compass,
  flask: FlaskConical,
} as const;

export function DisciplineIcon({
  name,
  size = 24,
}: {
  name: Discipline['iconName'];
  size?: number;
}) {
  const Icon = ICON_MAP[name];
  return <Icon size={size} aria-hidden="true" />;
}
