import { LucideIcon } from "lucide-react";
import {
  Gamepad2,
  Cpu,
  GraduationCap,
  Brain,
  Palette,
  Shield,
  GanttChartSquare,
  Briefcase,
  Database,
  Code,
  TrendingUp,
  Layers,
} from "lucide-react";

export const CATEGORY_ICONS: { [key: string]: LucideIcon } = {
  "game-dev-all": Gamepad2,
  hardware: Cpu,
  academics: GraduationCap,
  "artificial-intelligence": Brain,
  design: Palette,
  it: Shield,
  career: GanttChartSquare,
  productivity: Briefcase,
  "data-science": Database,
  "it-programming": Code,
  business: TrendingUp,
  // 기본 아이콘
  default: Layers,
};
