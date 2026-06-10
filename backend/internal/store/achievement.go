package store

import (
	"context"

	"portfolio/internal/models"
)

func (s *Store) ListAchievements(ctx context.Context) ([]models.Achievement, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, title, description, achieved_on, sort_order
		 FROM achievements ORDER BY sort_order, achieved_on DESC NULLS LAST`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []models.Achievement{}
	ids := []string{}
	for rows.Next() {
		var a models.Achievement
		if err := rows.Scan(&a.ID, &a.Title, &a.Description, &a.AchievedOn, &a.SortOrder); err != nil {
			return nil, err
		}
		a.CategoryIDs = []string{}
		items = append(items, a)
		ids = append(ids, a.ID)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	links, err := s.loadCategoryLinks(ctx, "achievement_categories", "achievement_id", ids)
	if err != nil {
		return nil, err
	}
	for i := range items {
		if cats := links[items[i].ID]; cats != nil {
			items[i].CategoryIDs = cats
		}
	}
	return items, nil
}

func (s *Store) CreateAchievement(ctx context.Context, in models.AchievementInput) (string, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	var id string
	if err := tx.QueryRow(ctx,
		`INSERT INTO achievements (title, description, achieved_on, sort_order)
		 VALUES ($1,$2,$3,$4) RETURNING id`,
		in.Title, in.Description, in.AchievedOn, in.SortOrder,
	).Scan(&id); err != nil {
		return "", err
	}
	if err := replaceCategoryLinks(ctx, tx, "achievement_categories", "achievement_id", id, in.CategoryIDs); err != nil {
		return "", err
	}
	return id, tx.Commit(ctx)
}

func (s *Store) UpdateAchievement(ctx context.Context, id string, in models.AchievementInput) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	ct, err := tx.Exec(ctx,
		`UPDATE achievements SET title=$2, description=$3, achieved_on=$4, sort_order=$5 WHERE id=$1`,
		id, in.Title, in.Description, in.AchievedOn, in.SortOrder)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return ErrNotFound
	}
	if err := replaceCategoryLinks(ctx, tx, "achievement_categories", "achievement_id", id, in.CategoryIDs); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (s *Store) DeleteAchievement(ctx context.Context, id string) error {
	return s.deleteByID(ctx, "achievements", id)
}
