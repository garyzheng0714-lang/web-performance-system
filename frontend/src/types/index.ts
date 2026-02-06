export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  supervisorId: string;
  role: string;
  status: string;
  entryDate?: string;
}

export interface Objective {
  recordId: string;
  objectiveId: string;
  userId: string;
  userName: string;
  periodId: string;
  periodName: string;
  title: string;
  description: string;
  type: string;
  weight: number;
  target: string;
  priority: string;
  dueDate: string;
  status: string;
  submittedAt: string;
  approvedAt: string;
  supervisorComment: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Completion {
  recordId: string;
  completionId: string;
  objectiveId: string;
  userId: string;
  userName: string;
  periodId: string;
  periodName: string;
  selfAssessment: string;
  actualValue: string;
  completionRate: number;
  selfScore: number;
  supervisorScore: number;
  calibrationScore: number;
  supervisorComment: string;
  evidence: string;
  status: string;
  submittedAt: string;
  scoredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page?: number;
  pageSize?: number;
  list: T[];
}
