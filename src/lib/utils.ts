import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RoomStatus, RoomType, ACStatus, CleaningStatus, MaintenanceStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------- Status Display Configs ----------

export const roomStatusConfig: Record<RoomStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  iconName: string;
}> = {
  vacant: {
    label: 'Vacant',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    iconName: 'circle-check',
  },
  occupied: {
    label: 'Occupied',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    iconName: 'user',
  },
  partially_occupied: {
    label: 'Partial',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    dotColor: 'bg-sky-500',
    iconName: 'user-plus',
  },
  reserved: {
    label: 'Reserved',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    iconName: 'calendar-clock',
  },
  under_maintenance: {
    label: 'Maintenance',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500',
    iconName: 'wrench',
  },
  cleaning: {
    label: 'Cleaning',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    dotColor: 'bg-violet-500',
    iconName: 'sparkles',
  },
  unavailable: {
    label: 'Unavailable',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400',
    iconName: 'ban',
  },
  non_functioning: {
    label: 'Non-Functioning',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-400',
    iconName: 'circle-x',
  },
};

export const roomTypeLabels: Record<RoomType, string> = {
  ac: 'AC',
  non_ac: 'Non-AC',
  dormitory: 'Dormitory',
  non_functioning: 'Non-Functioning',
  other: 'Other',
};

export const acStatusConfig: Record<ACStatus, {
  label: string;
  color: string;
  icon: string;
}> = {
  working: { label: 'Working', color: 'text-emerald-600', icon: 'snowflake' },
  not_working: { label: 'Not Working', color: 'text-red-600', icon: 'snowflake' },
  under_repair: { label: 'Under Repair', color: 'text-amber-600', icon: 'wrench' },
  not_applicable: { label: 'N/A', color: 'text-gray-400', icon: 'minus' },
};

export const cleaningStatusConfig: Record<CleaningStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  clean: { label: 'Clean', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: 'check-circle' },
  cleaning_required: { label: 'Cleaning Required', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: 'alert-triangle' },
  cleaning_in_progress: { label: 'Cleaning In Progress', color: 'text-violet-600', bgColor: 'bg-violet-50', icon: 'loader' },
};

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

// ---------- Helpers ----------

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getFloorLabel(floor: string): string {
  switch (floor) {
    case 'ground': return 'Ground Floor';
    case 'first': return 'First Floor';
    default: return floor;
  }
}

export function getBuildingLabel(building: string): string {
  switch (building) {
    case 'main_wing_a': return 'Main Building — Wing A';
    case 'main_wing_b': return 'Main Building — Wing B';
    case 'main_first': return 'Main Building — First Floor';
    case 'upper_block': return 'Upper Block';
    default: return building;
  }
}
