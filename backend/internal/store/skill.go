package store

import (
	"context"

	"portfolio/internal/models"
)

func (s *Store) ListSkills(ctx context.Context) ([]models.Skill, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, name, level, icon, sort_order FROM skills ORDER BY sort_order, name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	skills := []models.Skill{}
	ids := []string{}
	for rows.Next() {
		var sk models.Skill
		if err := rows.Scan(&sk.ID, &sk.Name, &sk.Level, &sk.Icon, &sk.SortOrder); err != nil {
			return nil, err
		}
		sk.CategoryIDs = []string{}
		skills = append(skills, sk)
		ids = append(ids, sk.ID)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	links, err := s.loadCategoryLinks(ctx, "skill_categories", "skill_id", ids)
	if err != nil {
		return nil, err
	}
	for i := range skills {
		if cats := links[skills[i].ID]; cats != nil {
			skills[i].CategoryIDs = cats
		}
	}
	return skills, nil
}

func (s *Store) CreateSkill(ctx context.Context, in models.SkillInput) (string, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	var id string
	if err := tx.QueryRow(ctx,
		`INSERT INTO skills (name, level, icon, sort_order) VALUES ($1,$2,$3,$4) RETURNING id`,
		in.Name, in.Level, in.Icon, in.SortOrder,
	).Scan(&id); err != nil {
		return "", err
	}
	if err := replaceCategoryLinks(ctx, tx, "skill_categories", "skill_id", id, in.CategoryIDs); err != nil {
		return "", err
	}
	return id, tx.Commit(ctx)
}

func (s *Store) UpdateSkill(ctx context.Context, id string, in models.SkillInput) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	ct, err := tx.Exec(ctx,
		`UPDATE skills SET name=$2, level=$3, icon=$4, sort_order=$5 WHERE id=$1`,
		id, in.Name, in.Level, in.Icon, in.SortOrder)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return ErrNotFound
	}
	if err := replaceCategoryLinks(ctx, tx, "skill_categories", "skill_id", id, in.CategoryIDs); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (s *Store) DeleteSkill(ctx context.Context, id string) error {
	return s.deleteByID(ctx, "skills", id)
}

func (s *Store) deleteByID(ctx context.Context, table, id string) error {
	ct, err := s.pool.Exec(ctx, `DELETE FROM `+table+` WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
