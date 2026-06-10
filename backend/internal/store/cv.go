package store

import (
	"context"

	"portfolio/internal/models"
)

// ── Education ──

func (s *Store) ListEducation(ctx context.Context) ([]models.Education, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, institution, degree, field, description, location,
			start_date, end_date, is_current, sort_order
		 FROM education ORDER BY sort_order, start_date DESC NULLS LAST`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []models.Education{}
	for rows.Next() {
		var e models.Education
		if err := rows.Scan(&e.ID, &e.Institution, &e.Degree, &e.Field, &e.Description,
			&e.Location, &e.StartDate, &e.EndDate, &e.IsCurrent, &e.SortOrder); err != nil {
			return nil, err
		}
		items = append(items, e)
	}
	return items, rows.Err()
}

func (s *Store) CreateEducation(ctx context.Context, e models.Education) (string, error) {
	var id string
	err := s.pool.QueryRow(ctx,
		`INSERT INTO education
			(institution, degree, field, description, location, start_date, end_date, is_current, sort_order)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
		e.Institution, e.Degree, e.Field, e.Description, e.Location,
		e.StartDate, e.EndDate, e.IsCurrent, e.SortOrder,
	).Scan(&id)
	return id, err
}

func (s *Store) UpdateEducation(ctx context.Context, id string, e models.Education) error {
	ct, err := s.pool.Exec(ctx,
		`UPDATE education SET institution=$2, degree=$3, field=$4, description=$5, location=$6,
			start_date=$7, end_date=$8, is_current=$9, sort_order=$10 WHERE id=$1`,
		id, e.Institution, e.Degree, e.Field, e.Description, e.Location,
		e.StartDate, e.EndDate, e.IsCurrent, e.SortOrder)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) DeleteEducation(ctx context.Context, id string) error {
	return s.deleteByID(ctx, "education", id)
}

// ── Work experience ──

func (s *Store) ListExperience(ctx context.Context) ([]models.Experience, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, company, role, location, description,
			start_date, end_date, is_current, sort_order, reference_url, reference_label
		 FROM work_experience ORDER BY sort_order, start_date DESC NULLS LAST`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []models.Experience{}
	for rows.Next() {
		var e models.Experience
		if err := rows.Scan(&e.ID, &e.Company, &e.Role, &e.Location, &e.Description,
			&e.StartDate, &e.EndDate, &e.IsCurrent, &e.SortOrder,
			&e.ReferenceURL, &e.ReferenceLabel); err != nil {
			return nil, err
		}
		items = append(items, e)
	}
	return items, rows.Err()
}

func (s *Store) CreateExperience(ctx context.Context, e models.Experience) (string, error) {
	var id string
	err := s.pool.QueryRow(ctx,
		`INSERT INTO work_experience
			(company, role, location, description, start_date, end_date, is_current, sort_order,
			 reference_url, reference_label)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
		e.Company, e.Role, e.Location, e.Description,
		e.StartDate, e.EndDate, e.IsCurrent, e.SortOrder,
		e.ReferenceURL, e.ReferenceLabel,
	).Scan(&id)
	return id, err
}

func (s *Store) UpdateExperience(ctx context.Context, id string, e models.Experience) error {
	ct, err := s.pool.Exec(ctx,
		`UPDATE work_experience SET company=$2, role=$3, location=$4, description=$5,
			start_date=$6, end_date=$7, is_current=$8, sort_order=$9,
			reference_url=$10, reference_label=$11 WHERE id=$1`,
		id, e.Company, e.Role, e.Location, e.Description,
		e.StartDate, e.EndDate, e.IsCurrent, e.SortOrder,
		e.ReferenceURL, e.ReferenceLabel)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) DeleteExperience(ctx context.Context, id string) error {
	return s.deleteByID(ctx, "work_experience", id)
}
