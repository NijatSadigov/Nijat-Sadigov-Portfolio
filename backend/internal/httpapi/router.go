package httpapi

import (
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"portfolio/internal/config"
	"portfolio/internal/store"
)

type Server struct {
	cfg   *config.Config
	store *store.Store
}

func NewRouter(cfg *config.Config, st *store.Store) http.Handler {
	s := &Server{cfg: cfg, store: st}

	r := chi.NewRouter()
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Timeout(30 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Route("/api", func(r chi.Router) {
		r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
			writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
		})

		// ── public ──
		r.Post("/auth/login", s.handleLogin)
		r.Get("/site", s.handleGetSite)
		r.Post("/contact", s.handleContact)
		r.Get("/profile", s.handleGetProfile)
		r.Get("/social-links", s.handleListSocialLinks)
		r.Get("/categories", s.handleListCategories)
		r.Get("/projects", s.handleListProjects)
		r.Get("/projects/{slug}", s.handleGetProject)
		r.Post("/projects/{slug}/view", s.handleProjectView)
		r.Get("/skills", s.handleListSkills)
		r.Get("/certifications", s.handleListCertifications)
		r.Get("/achievements", s.handleListAchievements)
		r.Get("/education", s.handleListEducation)
		r.Get("/experience", s.handleListExperience)
		r.Get("/resumes", s.handleListResumes)

		// ── admin ──
		r.Route("/admin", func(r chi.Router) {
			r.Use(s.requireAuth)

			r.Get("/me", s.handleMe)
			r.Post("/uploads", s.handleUpload)

			r.Put("/profile", s.handleUpdateProfile)
			r.Put("/social-links", s.handleReplaceSocialLinks)

			r.Get("/projects", s.handleAdminListProjects)
			r.Post("/projects", s.handleCreateProject)
			r.Put("/projects/{id}", s.handleUpdateProject)
			r.Delete("/projects/{id}", s.handleDeleteProject)
			r.Post("/projects/{id}/images", s.handleAddProjectImage)
			r.Put("/projects/{id}/cover/{imageId}", s.handleSetProjectCover)
			r.Delete("/project-images/{id}", s.handleDeleteProjectImage)

			r.Get("/skills", s.handleListSkills)
			r.Post("/skills", s.handleCreateSkill)
			r.Put("/skills/{id}", s.handleUpdateSkill)
			r.Delete("/skills/{id}", s.handleDeleteSkill)

			r.Get("/certifications", s.handleListCertifications)
			r.Post("/certifications", s.handleCreateCertification)
			r.Put("/certifications/{id}", s.handleUpdateCertification)
			r.Delete("/certifications/{id}", s.handleDeleteCertification)
			r.Post("/certifications/{id}/images", s.handleAddCertImage)
			r.Delete("/certification-images/{id}", s.handleDeleteCertImage)

			r.Get("/achievements", s.handleListAchievements)
			r.Post("/achievements", s.handleCreateAchievement)
			r.Put("/achievements/{id}", s.handleUpdateAchievement)
			r.Delete("/achievements/{id}", s.handleDeleteAchievement)

			r.Get("/education", s.handleListEducation)
			r.Post("/education", s.handleCreateEducation)
			r.Put("/education/{id}", s.handleUpdateEducation)
			r.Delete("/education/{id}", s.handleDeleteEducation)

			r.Get("/experience", s.handleListExperience)
			r.Post("/experience", s.handleCreateExperience)
			r.Put("/experience/{id}", s.handleUpdateExperience)
			r.Delete("/experience/{id}", s.handleDeleteExperience)

			r.Get("/resumes", s.handleListResumes)
			r.Post("/resumes", s.handleCreateResume)
			r.Delete("/resumes/{id}", s.handleDeleteResume)

			r.Get("/contact", s.handleListContact)
			r.Put("/contact/{id}/read", s.handleMarkContactRead)
			r.Delete("/contact/{id}", s.handleDeleteContact)
		})
	})

	uploadFS := http.FileServer(http.Dir(cfg.UploadDir))
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", uploadFS))

	if cfg.StaticDir != "" {
		r.Handle("/*", spaHandler(cfg.StaticDir))
	}

	return r
}

func spaHandler(dir string) http.HandlerFunc {
	fileServer := http.FileServer(http.Dir(dir))
	return func(w http.ResponseWriter, r *http.Request) {
		clean := filepath.Clean(r.URL.Path)
		path := filepath.Join(dir, clean)
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			fileServer.ServeHTTP(w, r)
			return
		}
		http.ServeFile(w, r, filepath.Join(dir, "index.html"))
	}
}
