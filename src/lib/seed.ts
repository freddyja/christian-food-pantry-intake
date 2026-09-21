import { fromZonedTime, getZonedParts, monthName } from "@/lib/timezone";

export type SeedHousehold = {
  id: string;
  primaryName: string;
  phone: string | null;
  address: string | null;
  householdSize: number;
  notes: string | null;
  active: boolean;
};

export type SeedVisit = {
  id: string;
  householdId: string;
  visitedAt: Date;
  isEmergency: boolean;
  emergencyReason: string | null;
  note: string | null;
};

export const SEED_HOUSEHOLDS: SeedHousehold[] = [
  {
    id: "hh_garcia",
    primaryName: "Garcia, Maria",
    phone: "3525550142",
    address: "12 Oak St, Spring Hill",
    householdSize: 4,
    notes: "Prefers Spanish when possible.",
    active: true,
  },
  {
    id: "hh_johnson",
    primaryName: "Johnson, T.",
    phone: "3525550198",
    address: "88 Pine Ave, Brooksville",
    householdSize: 2,
    notes: null,
    active: true,
  },
  {
    id: "hh_williams",
    primaryName: "Williams, Anita",
    phone: "3525550117",
    address: "4 Magnolia Ct, Spring Hill",
    householdSize: 3,
    notes: "Often arrives with two grandchildren.",
    active: true,
  },
  {
    id: "hh_chen",
    primaryName: "Chen, David",
    phone: "3525550160",
    address: null,
    householdSize: 1,
    notes: null,
    active: true,
  },
  {
    id: "hh_patel",
    primaryName: "Patel, Priya",
    phone: "3525550133",
    address: "210 Bay Rd, Weeki Wachee",
    householdSize: 5,
    notes: "Peanut allergy in the household.",
    active: true,
  },
  {
    id: "hh_brooks",
    primaryName: "Brooks, Samuel",
    phone: "3525550188",
    address: "19 Cedar Ln, Spring Hill",
    householdSize: 2,
    notes: null,
    active: true,
  },
  {
    id: "hh_nguyen",
    primaryName: "Nguyen, Linh",
    phone: "3525550104",
    address: "55 Harbor Dr, Hernando Beach",
    householdSize: 4,
    notes: null,
    active: true,
  },
  {
    id: "hh_thompson",
    primaryName: "Thompson, Ruth",
    phone: "3525550172",
    address: "7 Faith Way, Spring Hill",
    householdSize: 6,
    notes: "Needs help carrying bags to the car.",
    active: true,
  },
  {
    id: "hh_alvarez",
    primaryName: "Alvarez, Carlos",
    phone: "3525550155",
    address: "31 Palmetto St, Brooksville",
    householdSize: 3,
    notes: null,
    active: true,
  },
  {
    id: "hh_washington",
    primaryName: "Washington, Denise",
    phone: "3525550121",
    address: "14 Maple Ave, Spring Hill",
    householdSize: 2,
    notes: null,
    active: true,
  },
  {
    id: "hh_okafor",
    primaryName: "Okafor, Grace",
    phone: "3525550190",
    address: null,
    householdSize: 5,
    notes: "New to the area this year.",
    active: true,
  },
  {
    id: "hh_miller",
    primaryName: "Miller, James",
    phone: "3525550184",
    address: "9 Valley Rd, Spring Hill",
    householdSize: 1,
    notes: null,
    active: true,
  },
];

function monthsAgo(now: Date, months: number, day: number, hour: number, minute: number): Date {
  const parts = getZonedParts(now);
  let year = parts.year;
  let month = parts.month - months;
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  const safeDay = Math.min(day, 28);
  return fromZonedTime(year, month, safeDay, hour, minute);
}

function thisMonthOn(now: Date, day: number, hour: number, minute: number): Date {
  const parts = getZonedParts(now);
  const safeDay = Math.min(Math.max(1, day), parts.day);
  return fromZonedTime(parts.year, parts.month, safeDay, hour, minute);
}

function todayAt(now: Date, hour: number, minute: number): Date {
  const parts = getZonedParts(now);
  const candidate = fromZonedTime(parts.year, parts.month, parts.day, hour, minute);
  if (candidate.getTime() < now.getTime() - 2 * 60 * 1000) return candidate;
  return new Date(now.getTime() - 15 * 60 * 1000);
}

export function buildSeedVisits(now: Date = new Date()): SeedVisit[] {
  const parts = getZonedParts(now);
  const earlierDay = parts.day >= 8 ? 7 : Math.max(1, parts.day);
  const garciaThisMonth =
    parts.day === 1
      ? todayAt(now, 8, 40)
      : thisMonthOn(now, earlierDay, 10, 22);

  return [
    {
      id: "v_garcia_month",
      householdId: "hh_garcia",
      visitedAt: garciaThisMonth,
      isEmergency: false,
      emergencyReason: null,
      note: null,
    },
    {
      id: "v_garcia_prev",
      householdId: "hh_garcia",
      visitedAt: monthsAgo(now, 1, 12, 9, 5),
      isEmergency: false,
      emergencyReason: null,
      note: null,
    },
    {
      id: "v_garcia_emerg",
      householdId: "hh_garcia",
      visitedAt: monthsAgo(now, 2, 3, 11, 40),
      isEmergency: true,
      emergencyReason: "Refrigerator failure",
      note: null,
    },
    {
      id: "v_johnson_today",
      householdId: "hh_johnson",
      visitedAt: todayAt(now, 9, 2),
      isEmergency: false,
      emergencyReason: null,
      note: null,
    },
    {
      id: "v_miller_today",
      householdId: "hh_miller",
      visitedAt: todayAt(now, 8, 47),
      isEmergency: false,
      emergencyReason: null,
      note: null,
    },
    {
      id: "v_patel_month",
      householdId: "hh_patel",
      visitedAt: thisMonthOn(now, Math.min(3, parts.day), 11, 10),
      isEmergency: false,
      emergencyReason: null,
      note: null,
    },
    {
      id: "v_nguyen_month",
      householdId: "hh_nguyen",
      visitedAt: thisMonthOn(now, Math.min(15, parts.day), 10, 5),
      isEmergency: false,
      emergencyReason: null,
      note: null,
    },
    {
      id: "v_washington_month",
      householdId: "hh_washington",
      visitedAt: thisMonthOn(now, 1, 9, 30),
      isEmergency: false,
      emergencyReason: null,
      note: null,
    },
    {
      id: "v_williams_prev",
      householdId: "hh_williams",
      visitedAt: monthsAgo(now, 1, 20, 10, 15),
      isEmergency: false,
      emergencyReason: null,
      note: null,
    },
    {
      id: "v_thompson_older",
      householdId: "hh_thompson",
      visitedAt: monthsAgo(now, 4, 2, 9, 45),
      isEmergency: false,
      emergencyReason: null,
      note: "Picked up extra bread.",
    },
    {
      id: "v_alvarez_prev",
      householdId: "hh_alvarez",
      visitedAt: monthsAgo(now, 1, 8, 8, 55),
      isEmergency: false,
      emergencyReason: null,
      note: null,
    },
  ];
}

export function seedSummaryLabel(now: Date = new Date()): string {
  return monthName(getZonedParts(now).month);
}
