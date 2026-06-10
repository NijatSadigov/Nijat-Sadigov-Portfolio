package httpapi

import (
	"net/http"
	"strings"

	"portfolio/internal/models"
	"portfolio/internal/store"
)

// GET /api/site — everything the public homepage needs, in one payload.
func (s *Server) handleGetSite(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	profile, err := s.store.GetProfile(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load site")
		return
	}
	socials, _ := s.store.ListSocialLinks(ctx)
	categories, _ := s.store.ListCategories(ctx)
	projects, _ := s.store.ListProjects(ctx, store.ProjectFilter{PublishedOnly: true})
	skills, _ := s.store.ListSkills(ctx)
	certs, _ := s.store.ListCertifications(ctx)
	achievements, _ := s.store.ListAchievements(ctx)
	education, _ := s.store.ListEducation(ctx)
	experience, _ := s.store.ListExperience(ctx)
	resumes, _ := s.store.ListResumes(ctx)

	writeJSON(w, http.StatusOK, map[string]any{
		"profile":        profile,
		"socialLinks":    socials,
		"categories":     categories,
		"projects":       projects,
		"skills":         skills,
		"certifications": certs,
		"achievements":   achievements,
		"education":      education,
		"experience":     experience,
		"resumes":        resumes,
	})
}

// POST /api/contact — public contact form submission.
func (s *Server) handleContact(w http.ResponseWriter, r *http.Request) {
	var in models.ContactInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if strings.TrimSpace(in.Name) == "" || strings.TrimSpace(in.Email) == "" || strings.TrimSpace(in.Message) == "" {
		writeError(w, http.StatusBadRequest, "name, email and message are required")
		return
	}
	if _, err := s.store.CreateContactMessage(r.Context(), in); err != nil {
		writeError(w, http.StatusInternalServerError, "could not send message")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"status": "received"})
}
