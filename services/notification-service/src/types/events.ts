export interface TodoCreatedDetail {
  eventVersion: string;
  todoId: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface TodoCompletedDetail {
  eventVersion: string;
  todoId: string;
  status: string;
  completedAt: string;
}
