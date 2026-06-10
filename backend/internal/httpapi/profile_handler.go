package httpapi

import (
	"net/http"

	"portfolio/internal/models"
)

func (s *Server) handleGetProfile(w http.ResponseWriter, r *http.Request) {
	p, err := s.store.GetProfile(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load profile")
		return
	}
	links, err := s.store.ListSocialLinks(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load social links")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"profile":     p,
		"socialLinks": links,
	})
}

func (s *Server) handleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	var in models.Profile
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	p, err := s.store.UpdateProfile(r.Context(), in)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not update profile")
		return
	}
	writeJSON(w, http.StatusOK, p)
}

func (s *Server) handleListSocialLinks(w http.ResponseWriter, r *http.Request) {
	links, err := s.store.ListSocialLinks(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load social links")
		return
	}
	writeJSON(w, http.StatusOK, links)
}

func (s *Server) handleReplaceSocialLinks(w http.ResponseWriter, r *http.Request) {
	var links []models.SocialLink
	if err := decodeJSON(r, &links); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := s.store.ReplaceSocialLinks(r.Context(), links); err != nil {
		writeError(w, http.StatusInternalServerError, "could not save social links")
		return
	}
	s.handleListSocialLinks(w, r)
}

func (s *Server) handleListCategories(w http.ResponseWriter, r *http.Request) {
	cats, err := s.store.ListCategories(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load categories")
		return
	}
	writeJSON(w, http.StatusOK, cats)
}
