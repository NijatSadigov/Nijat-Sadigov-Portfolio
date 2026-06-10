package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"portfolio/internal/auth"
	"portfolio/internal/config"
	"portfolio/internal/database"
	"portfolio/internal/httpapi"
	"portfolio/internal/store"
)

func main() {
	// Load .env for local dev (real env vars take precedence and win in Docker).
	for _, p := range []string{".env", "../.env"} {
		_ = godotenv.Load(p)
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	ctx := context.Background()

	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	if err := database.Migrate(ctx, pool); err != nil {
		log.Fatalf("migrate: %v", err)
	}
	log.Println("migrations up to date")

	st := store.New(pool)
	bootstrapAdmin(ctx, st, cfg)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           httpapi.NewRouter(cfg, st),
		ReadHeaderTimeout: 10 * time.Second,
	}

	// Graceful shutdown on SIGINT/SIGTERM.
	go func() {
		log.Printf("listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Println("shutting down...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}

// bootstrapAdmin creates the first admin account from env if none exists yet.
func bootstrapAdmin(ctx context.Context, st *store.Store, cfg *config.Config) {
	n, err := st.CountAdmins(ctx)
	if err != nil {
		log.Printf("admin bootstrap: count failed: %v", err)
		return
	}
	if n > 0 {
		return
	}
	if cfg.AdminEmail == "" || cfg.AdminPassword == "" {
		log.Println("admin bootstrap: no admin exists and ADMIN_EMAIL/ADMIN_PASSWORD are unset — skipping")
		return
	}
	hash, err := auth.HashPassword(cfg.AdminPassword)
	if err != nil {
		log.Printf("admin bootstrap: hash failed: %v", err)
		return
	}
	if _, err := st.CreateAdmin(ctx, strings.ToLower(cfg.AdminEmail), hash, cfg.AdminName); err != nil {
		log.Printf("admin bootstrap: create failed: %v", err)
		return
	}
	log.Printf("admin bootstrap: created admin %s", cfg.AdminEmail)
}
