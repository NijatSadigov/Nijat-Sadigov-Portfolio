package store

import (
	"context"

	"portfolio/internal/models"
)

func (s *Store) ListCategories(ctx context.Context) ([]models.Category, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, slug, name, description, theme, accent_color, sort_order
		 FROM categories ORDER BY sort_order, name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cats := []models.Category{}
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.ID, &c.Slug, &c.Name, &c.Description, &c.Theme, &c.AccentColor, &c.SortOrder); err != nil {
			return nil, err
		}
		cats = append(cats, c)
	}
	return cats, rows.Err()
}
