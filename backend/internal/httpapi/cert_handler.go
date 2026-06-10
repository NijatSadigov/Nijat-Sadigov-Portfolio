package httpapi

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"portfolio/internal/models"
)

func (s *Server) handleListCertifications(w http.ResponseWriter, r *http.Request) {
	items, err := s.store.ListCertifications(r.Context())
	if notFoundOr(w, err, "could not load certifications") {
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) handleCreateCertification(w http.ResponseWriter, r *http.Request) {
	var in models.CertificationInput
	if err := decodeJSON(r, &in); err != nil || in.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}
	id, err := s.store.CreateCertification(r.Context(), in)
	if notFoundOr(w, err, "could not create certification") {
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}

func (s *Server) handleUpdateCertification(w http.ResponseWriter, r *http.Request) {
	var in models.CertificationInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	if notFoundOr(w, s.store.UpdateCertification(r.Context(), chi.URLParam(r, "id"), in), "could not update certification") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleDeleteCertification(w http.ResponseWriter, r *http.Request) {
	if notFoundOr(w, s.store.DeleteCertification(r.Context(), chi.URLParam(r, "id")), "could not delete certification") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleAddCertImage(w http.ResponseWriter, r *http.Request) {
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
	img, err := s.store.AddCertImage(r.Context(), id, body.URL, body.Caption, body.IsCover)
	if notFoundOr(w, err, "could not add image") {
		return
	}
	writeJSON(w, http.StatusCreated, img)
}

func (s *Server) handleDeleteCertImage(w http.ResponseWriter, r *http.Request) {
	if notFoundOr(w, s.store.DeleteCertImage(r.Context(), chi.URLParam(r, "id")), "could not delete image") {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
