package store

import (
	"context"

	"portfolio/internal/models"
)

func (s *Store) ListSocialLinks(ctx context.Context) ([]models.SocialLink, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, platform, label, url, icon, sort_order
		 FROM social_links ORDER BY sort_order, platform`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	links := []models.SocialLink{}
	for rows.Next() {
		var l models.SocialLink
		if err := rows.Scan(&l.ID, &l.Platform, &l.Label, &l.URL, &l.Icon, &l.SortOrder); err != nil {
			return nil, err
		}
		links = append(links, l)
	}
	return links, rows.Err()
}

// ReplaceSocialLinks swaps the full set of links in one transaction.
func (s *Store) ReplaceSocialLinks(ctx context.Context, links []models.SocialLink) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `DELETE FROM social_links`); err != nil {
		return err
	}
	for i, l := range links {
		order := l.SortOrder
		if order == 0 {
			order = i
		}
		if _, err := tx.Exec(ctx,
			`INSERT INTO social_links (platform, label, url, icon, sort_order)
			 VALUES ($1,$2,$3,$4,$5)`,
			l.Platform, l.Label, l.URL, l.Icon, order); err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}
