export type Household = {
  id: string;
  primaryName: string;
  phone: string | null;
  address: string | null;
  householdSize: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  active: boolean;
};

export type Visit = {
  id: string;
  householdId: string;
  visitedAt: string;
  served: boolean;
  isEmergency: boolean;
  emergencyReason: string | null;
  note: string | null;
  recordedBy: string | null;
  undoneAt: string | null;
};

export type HouseholdStatus = {
  household: Household;
  eligible: boolean;
  thisMonthVisit: Visit | null;
  lastVisit: Visit | null;
};

export type BackupFile = {
  version: 1;
  exportedAt: string;
  households: Household[];
  visits: Visit[];
};
