// ============================================================
// Room Layout Configuration
// Defines the spatial arrangement for the property map
// ============================================================

export interface FloorConfig {
  id: string;
  label: string;
  shortLabel: string;
  buildings: BuildingConfig[];
}

export interface BuildingConfig {
  id: string;
  label: string;
  layout: 'horizontal' | 'vertical' | 'corridor' | 'l-shape';
  rooms: number[];
  gridCols?: number;
  gridRows?: number;
}

export const FLOOR_CONFIGS: FloorConfig[] = [
  {
    id: 'ground',
    label: 'Ground Floor',
    shortLabel: 'Ground',
    buildings: [
      {
        id: 'main_wing_a',
        label: 'Wing A (Rooms 11–20)',
        layout: 'horizontal',
        rooms: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        gridCols: 10,
      },
      {
        id: 'main_wing_b',
        label: 'Wing B (Rooms 30–39)',
        layout: 'vertical',
        rooms: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
        gridRows: 10,
      },
    ],
  },
  {
    id: 'first',
    label: 'First Floor',
    shortLabel: '1st Floor',
    buildings: [
      {
        id: 'main_first',
        label: 'First Floor (Rooms 21–29)',
        layout: 'horizontal',
        rooms: [21, 22, 23, 24, 25, 26, 27, 28, 29],
        gridCols: 9,
      },
    ],
  },
  {
    id: 'upper_block',
    label: 'Upper Block',
    shortLabel: 'Upper',
    buildings: [
      {
        id: 'upper_block',
        label: 'Upper Block (Rooms 40–54)',
        layout: 'corridor',
        rooms: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
      },
    ],
  },
];

// Get all room numbers across all floors
export function getAllRoomNumbers(): number[] {
  return FLOOR_CONFIGS.flatMap(f => f.buildings.flatMap(b => b.rooms));
}

// Get floor config by ID
export function getFloorConfig(floorId: string): FloorConfig | undefined {
  return FLOOR_CONFIGS.find(f => f.id === floorId);
}

// Get floor for a given room number
export function getFloorForRoom(roomNumber: number): string {
  for (const floor of FLOOR_CONFIGS) {
    for (const building of floor.buildings) {
      if (building.rooms.includes(roomNumber)) {
        return floor.id;
      }
    }
  }
  return 'ground';
}

// Get building for a given room number
export function getBuildingForRoom(roomNumber: number): string {
  for (const floor of FLOOR_CONFIGS) {
    for (const building of floor.buildings) {
      if (building.rooms.includes(roomNumber)) {
        return building.id;
      }
    }
  }
  return 'main_wing_a';
}

// Corridor layout helper: split rooms into left/right pairs
export function getCorridorPairs(rooms: number[]): Array<{ left: number; right: number | null }> {
  const pairs: Array<{ left: number; right: number | null }> = [];
  for (let i = 0; i < rooms.length; i += 2) {
    pairs.push({
      left: rooms[i],
      right: rooms[i + 1] ?? null,
    });
  }
  return pairs;
}
