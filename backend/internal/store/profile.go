package store

import (
	"context"

	"portfolio/internal/models"
)

func (s *Store) GetProfile(ctx context.Context) (*models.Profile, error) {
	var p models.Profile
	err := s.pool.QueryRow(ctx,
		`SELECT full_name, headline, bio, photo_url, email, phone, location, open_to_work, updated_at
		 FROM profile WHERE id = 1`,
	).Scan(&p.FullName, &p.Headline, &p.Bio, &p.PhotoURL, &p.Email, &p.Phone, &p.Location, &p.OpenToWork, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (s *Store) UpdateProfile(ctx context.Context, p models.Profile) (*models.Profile, error) {
	var out models.Profile
	err := s.pool.QueryRow(ctx,
		`UPDATE profile SET
			full_name = $1, headline = $2, bio = $3, photo_url = $4,
			email = $5, phone = $6, location = $7, open_to_work = $8, updated_at = now()
		 WHERE id = 1
		 RETURNING full_name, headline, bio, photo_url, email, phone, location, open_to_work, updated_at`,
		p.FullName, p.Headline, p.Bio, p.PhotoURL, p.Email, p.Phone, p.Location, p.OpenToWork,
	).Scan(&out.FullName, &out.Headline, &out.Bio, &out.PhotoURL, &out.Email, &out.Phone, &out.Location, &out.OpenToWork, &out.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &out, nil
}
