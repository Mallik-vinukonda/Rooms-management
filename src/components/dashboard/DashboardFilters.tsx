'use client';

interface DashboardFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function DashboardFilters({ activeFilter, onFilterChange }: DashboardFiltersProps) {
  const filters = [
    { id: 'all', label: 'All Rooms' },
    { id: 'vacant', label: 'Vacant' },
    { id: 'occupied', label: 'Occupied' },
    { id: 'partially_occupied', label: 'Partial' },
    { id: 'reserved', label: 'Reserved' },
    { id: 'under_maintenance', label: 'Maintenance' },
    { id: 'cleaning_required', label: 'Cleaning Req.' },
    { id: 'ac_issue', label: 'AC Issue' },
    { id: 'ac', label: 'AC Rooms' },
    { id: 'non_ac', label: 'Non-AC' },
    { id: 'dormitory', label: 'Dormitory' },
    { id: 'non_functioning', label: 'Non-Function.' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`
            px-3 py-1.5 rounded-full text-xs font-medium border transition-all
            ${activeFilter === filter.id
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'}
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
