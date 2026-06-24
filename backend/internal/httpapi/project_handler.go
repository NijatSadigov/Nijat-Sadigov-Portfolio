package httpapi

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"

	"portfolio/internal/models"
	"portfolio/internal/store"
)

func (s *Server) handleListProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := s.store.ListProjects(r.Context(), store.ProjectFilter{
		PublishedOnly: true,
		CategoryID:    r.URL.Query().Get("category"),
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load projects")
		return
	}
	writeJSON(w, http.StatusOK, projects)
}

func (s *Server) handleGetProject(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	p, err := s.store.GetProjectBySlug(r.Context(), slug)
	if errors.Is(err, store.ErrNotFound) || (p != nil && p.Status != "published") {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load project")
		return
	}
	writeJSON(w, http.StatusOK, p)
}

func (s *Server) handleProjectView(w http.ResponseWriter, r *http.Request) {
	if err := s.store.IncrementProjectView(r.Context(), chi.URLParam(r, "slug")); err != nil {
		writeError(w, http.StatusInternalServerError, "could not record view")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ── admin ────────────────────────────────────────────────────

func (s *Server) handleAdminListProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := s.store.ListProjects(r.Context(), store.ProjectFilter{PublishedOnly: false})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load projects")
		return
	}
	writeJSON(w, http.StatusOK, projects)
}

func (s *Server) handleCreateProject(w http.ResponseWriter, r *http.Request) {
	var in models.ProjectInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if in.Title == "" || in.Slug == "" {
		writeError(w, http.StatusBadRequest, "title and slug are required")
		return
	}
	p, err := s.store.CreateProject(r.Context(), in)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create project")
		return
	}
	writeJSON(w, http.StatusCreated, p)
}

func (s *Server) handleUpdateProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var in models.ProjectInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	p, err := s.store.UpdateProject(r.Context(), id, in)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not update project")
		return
	}
	writeJSON(w, http.StatusOK, p)
}

func (s *Server) handleDeleteProject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := s.store.DeleteProject(r.Context(), id); errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "project not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete project")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleAddProjectImage(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var body struct {
		URL     string `json:"url"`
		Caption string `json:"caption"`
		IsCover bool   `json:"isCover"`
	}
	if err := decodeJSON(r, &body); err != nil || body.URL == "" {
		writeError(w, http.StatusBadRequest, "url is required")
		return
	}
	img, err := s.store.AddProjectImage(r.Context(), id, body.URL, body.Caption, body.IsCover)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not add image")
		return
	}
	writeJSON(w, http.StatusCreated, img)
}

func (s *Server) handleDeleteProjectImage(w http.ResponseWriter, r *http.Request) {
	if err := s.store.DeleteProjectImage(r.Context(), chi.URLParam(r, "id")); errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "image not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "could not delete image")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleSetProjectCover(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	imageID := chi.URLParam(r, "imageId")
	if err := s.store.SetProjectCover(r.Context(), projectID, imageID); errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "image not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "could not set cover")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
