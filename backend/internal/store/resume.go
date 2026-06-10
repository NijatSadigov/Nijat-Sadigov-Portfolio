package store

import (
	"context"

	"portfolio/internal/models"
)

func (s *Store) ListResumes(ctx context.Context) ([]models.Resume, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, category_id, label, file_url, is_main, uploaded_at
		 FROM resumes ORDER BY is_main DESC, uploaded_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []models.Resume{}
	for rows.Next() {
		var r models.Resume
		if err := rows.Scan(&r.ID, &r.CategoryID, &r.Label, &r.FileURL, &r.IsMain, &r.UploadedAt); err != nil {
			return nil, err
		}
		items = append(items, r)
	}
	return items, rows.Err()
}

// CreateResume enforces "0 or 1 per category" by replacing any existing resume
// for the same category, and "one main" by clearing other mains when needed.
func (s *Store) CreateResume(ctx context.Context, in models.ResumeInput) (string, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	if in.CategoryID != nil {
		if _, err := tx.Exec(ctx, `DELETE FROM resumes WHERE category_id = $1`, *in.CategoryID); err != nil {
			return "", err
		}
	}
	if in.IsMain {
		if _, err := tx.Exec(ctx, `UPDATE resumes SET is_main = false WHERE is_main = true`); err != nil {
			return "", err
		}
	}

	var id string
	if err := tx.QueryRow(ctx,
		`INSERT INTO resumes (category_id, label, file_url, is_main)
		 VALUES ($1,$2,$3,$4) RETURNING id`,
		in.CategoryID, in.Label, in.FileURL, in.IsMain,
	).Scan(&id); err != nil {
		return "", err
	}
	return id, tx.Commit(ctx)
}

func (s *Store) DeleteResume(ctx context.Context, id string) error {
	return s.deleteByID(ctx, "resumes", id)
}
