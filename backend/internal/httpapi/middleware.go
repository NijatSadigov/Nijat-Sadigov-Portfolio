package httpapi

import (
	"context"
	"net/http"
	"strings"

	"portfolio/internal/auth"
)

type ctxKey string

const claimsKey ctxKey = "claims"

func (s *Server) requireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		const prefix = "Bearer "
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, prefix) {
			writeError(w, http.StatusUnauthorized, "missing bearer token")
			return
		}
		claims, err := auth.ParseToken(s.cfg.JWTSecret, strings.TrimPrefix(header, prefix))
		if err != nil {
			writeError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		ctx := context.WithValue(r.Context(), claimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func claimsFrom(ctx context.Context) *auth.Claims {
	c, _ := ctx.Value(claimsKey).(*auth.Claims)
	return c
}
