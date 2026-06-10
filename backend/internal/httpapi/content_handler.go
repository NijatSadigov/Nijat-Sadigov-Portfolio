package httpapi

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"

	"portfolio/internal/models"
	"portfolio/internal/store"
)

// notFoundOr writes 404 for ErrNotFound, 500 otherwise; returns true if it wrote.
func notFoundOr(w http.ResponseWriter, err error, msg string) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "not found")
	} else {
		writeError(w, http.StatusInternalServerError, msg)
	}
	return true
}

// ── Skills ──

func (s *Server) handleListSkills(w http.ResponseWriter, r *http.Request) {
	items, err := s.store.ListSkills(r.Context())
	if notFoundOr(w, err, "could not load skills") {
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) handleCreateSkill(w http.ResponseWriter, r *http.Request) {
	var in models.SkillInput
	if err := decodeJSON(r, &in); err != nil || in.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	id, err := s.store.CreateSkill(r.Context(), in)
	if notFoundOr(w, err, "could not create skill") {
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}

func (s *Server) handleUpdateSkill(w http.ResponseWriter, r *http.Request) {
	var in models.SkillInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	if notFoundOr(w, s.store.UpdateSkill(r.Context(), chi.URLParam(r, "id"), in), "could not update skill") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleDeleteSkill(w http.ResponseWriter, r *http.Request) {
	if notFoundOr(w, s.store.DeleteSkill(r.Context(), chi.URLParam(r, "id")), "could not delete skill") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ── Achievements ──

func (s *Server) handleListAchievements(w http.ResponseWriter, r *http.Request) {
	items, err := s.store.ListAchievements(r.Context())
	if notFoundOr(w, err, "could not load achievements") {
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) handleCreateAchievement(w http.ResponseWriter, r *http.Request) {
	var in models.AchievementInput
	if err := decodeJSON(r, &in); err != nil || in.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}
	id, err := s.store.CreateAchievement(r.Context(), in)
	if notFoundOr(w, err, "could not create achievement") {
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}

func (s *Server) handleUpdateAchievement(w http.ResponseWriter, r *http.Request) {
	var in models.AchievementInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	if notFoundOr(w, s.store.UpdateAchievement(r.Context(), chi.URLParam(r, "id"), in), "could not update achievement") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleDeleteAchievement(w http.ResponseWriter, r *http.Request) {
	if notFoundOr(w, s.store.DeleteAchievement(r.Context(), chi.URLParam(r, "id")), "could not delete achievement") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ── Education ──

func (s *Server) handleListEducation(w http.ResponseWriter, r *http.Request) {
	items, err := s.store.ListEducation(r.Context())
	if notFoundOr(w, err, "could not load education") {
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) handleCreateEducation(w http.ResponseWriter, r *http.Request) {
	var in models.Education
	if err := decodeJSON(r, &in); err != nil || in.Institution == "" {
		writeError(w, http.StatusBadRequest, "institution is required")
		return
	}
	id, err := s.store.CreateEducation(r.Context(), in)
	if notFoundOr(w, err, "could not create education") {
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}

func (s *Server) handleUpdateEducation(w http.ResponseWriter, r *http.Request) {
	var in models.Education
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	if notFoundOr(w, s.store.UpdateEducation(r.Context(), chi.URLParam(r, "id"), in), "could not update education") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleDeleteEducation(w http.ResponseWriter, r *http.Request) {
	if notFoundOr(w, s.store.DeleteEducation(r.Context(), chi.URLParam(r, "id")), "could not delete education") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ── Experience ──

func (s *Server) handleListExperience(w http.ResponseWriter, r *http.Request) {
	items, err := s.store.ListExperience(r.Context())
	if notFoundOr(w, err, "could not load experience") {
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) handleCreateExperience(w http.ResponseWriter, r *http.Request) {
	var in models.Experience
	if err := decodeJSON(r, &in); err != nil || in.Company == "" {
		writeError(w, http.StatusBadRequest, "company is required")
		return
	}
	id, err := s.store.CreateExperience(r.Context(), in)
	if notFoundOr(w, err, "could not create experience") {
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}

func (s *Server) handleUpdateExperience(w http.ResponseWriter, r *http.Request) {
	var in models.Experience
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	if notFoundOr(w, s.store.UpdateExperience(r.Context(), chi.URLParam(r, "id"), in), "could not update experience") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleDeleteExperience(w http.ResponseWriter, r *http.Request) {
	if notFoundOr(w, s.store.DeleteExperience(r.Context(), chi.URLParam(r, "id")), "could not delete experience") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ── Résumés ──

func (s *Server) handleListResumes(w http.ResponseWriter, r *http.Request) {
	items, err := s.store.ListResumes(r.Context())
	if notFoundOr(w, err, "could not load resumes") {
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) handleCreateResume(w http.ResponseWriter, r *http.Request) {
	var in models.ResumeInput
	if err := decodeJSON(r, &in); err != nil || in.FileURL == "" {
		writeError(w, http.StatusBadRequest, "fileUrl is required")
		return
	}
	id, err := s.store.CreateResume(r.Context(), in)
	if notFoundOr(w, err, "could not save resume") {
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}

func (s *Server) handleDeleteResume(w http.ResponseWriter, r *http.Request) {
	if notFoundOr(w, s.store.DeleteResume(r.Context(), chi.URLParam(r, "id")), "could not delete resume") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ── Contact (admin views) ──

func (s *Server) handleListContact(w http.ResponseWriter, r *http.Request) {
	items, err := s.store.ListContactMessages(r.Context())
	if notFoundOr(w, err, "could not load messages") {
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) handleMarkContactRead(w http.ResponseWriter, r *http.Request) {
	if notFoundOr(w, s.store.MarkContactRead(r.Context(), chi.URLParam(r, "id")), "could not update message") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleDeleteContact(w http.ResponseWriter, r *http.Request) {
	if notFoundOr(w, s.store.DeleteContactMessage(r.Context(), chi.URLParam(r, "id")), "could not delete message") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
