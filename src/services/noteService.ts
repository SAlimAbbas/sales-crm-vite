import { apiService } from "./api";

export interface Note {
  id: number;
  lead_id: number;
  created_by: number;
  content: string;
  note_date: string;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface NoteFormData {
  lead_id: number;
  content: string;
  note_date: string;
}

export const noteService = {
  getNotes: (leadId?: number) =>
    apiService
      .get<{ data: Note[] }>("/notes", leadId ? { lead_id: leadId } : undefined)
      .then((response) => response.data || response),

  createNote: (data: NoteFormData) =>
    apiService
      .post<Note>("/notes", data)
      .then((response) => response.data || response),

  updateNote: (id: number, data: Partial<NoteFormData>) =>
    apiService
      .put<Note>(`/notes/${id}`, data)
      .then((response) => response.data || response),

  deleteNote: (id: number) => apiService.delete(`/notes/${id}`),
};
