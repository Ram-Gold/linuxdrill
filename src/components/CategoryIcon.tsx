import {
  Terminal,
  Users,
  Package,
  Network,
  HardDrive,
  Cpu,
  Shield,
  FileCode,
  Folder,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "../lib/types";

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  BASIC: Terminal,
  USER: Users,
  PKG: Package,
  NET: Network,
  FS: HardDrive,
  SVC: Cpu,
  SEC: Shield,
  SCR: FileCode,
};

interface CategoryIconProps {
  category?: Category | string;
  className?: string;
}

export default function CategoryIcon({
  category,
  className = "w-4 h-4",
}: CategoryIconProps) {
  const Icon = (category && CATEGORY_ICONS[category as Category]) || Folder;
  return <Icon className={className} strokeWidth={2} />;
}
