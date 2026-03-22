export interface CreateTemplatePayload {
  day_of_week: number;
  active: boolean;
}

export interface UpdateTemplatePayload {
  active: boolean;
}

export interface CreateExceptionPayload {
  date: string; // YYYY-MM-DD
}
