package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("not found")

type Store struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Store { return &Store{pool: pool} }

// ── Admin users ──────────────────────────────────────────────

type AdminUser struct {
	ID           string
	Email        string
	PasswordHash string
	Name         string
}

func (s *Store) CountAdmins(ctx context.Context) (int, error) {
	var n int
	err := s.pool.QueryRow(ctx, `SELECT count(*) FROM admin_users`).Scan(&n)
	return n, err
}

func (s *Store) GetAdminByEmail(ctx context.Context, email string) (*AdminUser, error) {
	var u AdminUser
	err := s.pool.QueryRow(ctx,
		`SELECT id, email, password_hash, name FROM admin_users WHERE email = $1`, email,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *Store) CreateAdmin(ctx context.Context, email, passwordHash, name string) (*AdminUser, error) {
	var u AdminUser
	err := s.pool.QueryRow(ctx,
		`INSERT INTO admin_users (email, password_hash, name)
		 VALUES ($1, $2, $3)
		 RETURNING id, email, password_hash, name`,
		email, passwordHash, name,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Name)
	return &u, err
}
