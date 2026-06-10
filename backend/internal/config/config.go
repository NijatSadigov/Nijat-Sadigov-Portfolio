// Package config loads runtime configuration from environment variables.
package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	Port          string
	DatabaseURL   string
	JWTSecret     string
	CORSOrigins   []string
	UploadDir     string
	PublicBaseURL string
	StaticDir     string // built SPA to serve; empty = don't serve a frontend

	AdminEmail    string
	AdminPassword string
	AdminName     string
}

// Load reads config from the environment, applying sensible defaults for local dev.
func Load() (*Config, error) {
	c := &Config{
		Port:          env("PORT", "8080"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		JWTSecret:     os.Getenv("JWT_SECRET"),
		UploadDir:     env("UPLOAD_DIR", "./uploads"),
		PublicBaseURL: env("PUBLIC_BASE_URL", "http://localhost:8080"),
		StaticDir:     os.Getenv("STATIC_DIR"),
		AdminEmail:    os.Getenv("ADMIN_EMAIL"),
		AdminPassword: os.Getenv("ADMIN_PASSWORD"),
		AdminName:     env("ADMIN_NAME", "Admin"),
	}

	for _, o := range strings.Split(env("CORS_ORIGIN", "http://localhost:5173"), ",") {
		if o = strings.TrimSpace(o); o != "" {
			c.CORSOrigins = append(c.CORSOrigins, o)
		}
	}

	if c.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if c.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	return c, nil
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
