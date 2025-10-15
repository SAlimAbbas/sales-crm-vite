import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Paper,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { noteService, Note, NoteFormData } from "../../services/noteService";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";

interface LeadNotesDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: number;
  leadName: string;
}

const LeadNotesDialog: React.FC<LeadNotesDialogProps> = ({
  open,
  onClose,
  leadId,
  leadName,
}) => {
  const [noteContent, setNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notesData, isLoading } = useQuery<any>({
    queryKey: ["notes", leadId],
    queryFn: () => noteService.getNotes(leadId),
    enabled: open,
  });

  
  const createMutation = useMutation({
    mutationFn: (data: NoteFormData) => noteService.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", leadId] });
      setNoteContent("");
      showNotification("Note added successfully", "success");
    },
    onError: () => {
      showNotification("Failed to add note", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NoteFormData> }) =>
      noteService.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", leadId] });
      setEditingNote(null);
      setNoteContent("");
      showNotification("Note updated successfully", "success");
    },
    onError: () => {
      showNotification("Failed to update note", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => noteService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", leadId] });
      showNotification("Note deleted successfully", "success");
    },
    onError: () => {
      showNotification("Failed to delete note", "error");
    },
  });

  const handleSubmit = () => {
    if (!noteContent.trim()) {
      showNotification("Please enter note content", "warning");
      return;
    }

    if (editingNote) {
      updateMutation.mutate({
        id: editingNote.id,
        data: {
          content: noteContent,
          note_date: new Date().toISOString().split("T")[0],
        },
      });
    } else {
      createMutation.mutate({
        lead_id: leadId,
        content: noteContent,
        note_date: new Date().toISOString().split("T")[0],
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNoteContent("");
  };

  const notes = notesData || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Notes for {leadName}</DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            multiline
            rows={3}
            fullWidth
            placeholder="Add a note..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            disabled={createMutation.isPending || updateMutation.isPending}
          />
          <Box
            sx={{ mt: 1, display: "flex", gap: 1, justifyContent: "flex-end" }}
          >
            {editingNote && (
              <Button size="small" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={editingNote ? <EditIcon /> : <AddIcon />}
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingNote ? "Update Note" : "Add Note"}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {isLoading ? (
          <Typography>Loading notes...</Typography>
        ) : notes?.length === 0 ? (
          <Alert severity="info">
            No notes yet. Add your first note above.
          </Alert>
        ) : (
          <List>
            {notes?.map((note:any) => (
              <Paper key={note.id} sx={{ mb: 2, p: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="start"
                >
                  <Box flex={1}>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {note.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {note.created_by?.name} •{" "}
                      {new Date(note.note_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {user?.id === note.created_by.id && (
                    <Box>
                      <IconButton size="small" onClick={() => handleEdit(note)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(note.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Paper>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeadNotesDialog;
