package store

import (
	"context"

	"portfolio/internal/models"
)

func (s *Store) CreateContactMessage(ctx context.Context, in models.ContactInput) (string, error) {
	var id string
	err := s.pool.QueryRow(ctx,
		`INSERT INTO contact_messages (name, email, subject, message)
		 VALUES ($1,$2,$3,$4) RETURNING id`,
		in.Name, in.Email, in.Subject, in.Message,
	).Scan(&id)
	return id, err
}

func (s *Store) ListContactMessages(ctx context.Context) ([]models.ContactMessage, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, name, email, subject, message, is_read, created_at
		 FROM contact_messages ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []models.ContactMessage{}
	for rows.Next() {
		var m models.ContactMessage
		if err := rows.Scan(&m.ID, &m.Name, &m.Email, &m.Subject, &m.Message, &m.IsRead, &m.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, m)
	}
	return items, rows.Err()
}

func (s *Store) MarkContactRead(ctx context.Context, id string) error {
	ct, err := s.pool.Exec(ctx, `UPDATE contact_messages SET is_read = true WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) DeleteContactMessage(ctx context.Context, id string) error {
	return s.deleteByID(ctx, "contact_messages", id)
}
