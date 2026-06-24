package store

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"

	"portfolio/internal/models"
)

const projectColumns = `
	p.id, p.slug, p.title, p.summary, p.description, p.repo_url, p.demo_url,
	p.demo_type, p.demo_guide, p.status, p.featured, p.view_count,
	p.started_on, p.ended_on, p.sort_order, p.created_at, p.updated_at`

func scanProject(row pgx.Row) (*models.Project, error) {
	var p models.Project
	err := row.Scan(
		&p.ID, &p.Slug, &p.Title, &p.Summary, &p.Description, &p.RepoURL, &p.DemoURL,
		&p.DemoType, &p.DemoGuide, &p.Status, &p.Featured, &p.ViewCount,
		&p.StartedOn, &p.EndedOn, &p.SortOrder, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	p.CategoryIDs = []string{}
	p.Images = []models.ProjectImage{}
	p.Tech = []string{}
	return &p, nil
}

type ProjectFilter struct {
	PublishedOnly bool
	CategoryID    string
}

func (s *Store) ListProjects(ctx context.Context, f ProjectFilter) ([]models.Project, error) {
	q := `SELECT DISTINCT ` + projectColumns + ` FROM projects p`
	var args []any
	var conds []string

	if f.CategoryID != "" {
		q += ` JOIN project_categories pc ON pc.project_id = p.id`
		args = append(args, f.CategoryID)
		conds = append(conds, fmt.Sprintf("pc.category_id = $%d", len(args)))
	}
	if f.PublishedOnly {
		conds = append(conds, "p.status = 'published'")
	}
	if len(conds) > 0 {
		q += " WHERE " + strings.Join(conds, " AND ")
	}
	q += " ORDER BY p.featured DESC, p.sort_order, p.created_at DESC"

	rows, err := s.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*models.Project
	for rows.Next() {
		p, err := scanProject(rows)
		if err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if err := s.loadProjectRelations(ctx, list); err != nil {
		return nil, err
	}

	out := make([]models.Project, len(list))
	for i, p := range list {
		out[i] = *p
	}
	return out, nil
}

func (s *Store) GetProjectBySlug(ctx context.Context, slug string) (*models.Project, error) {
	return s.getProjectWhere(ctx, "p.slug = $1", slug)
}

func (s *Store) GetProjectByID(ctx context.Context, id string) (*models.Project, error) {
	return s.getProjectWhere(ctx, "p.id = $1", id)
}

func (s *Store) getProjectWhere(ctx context.Context, where string, arg any) (*models.Project, error) {
	row := s.pool.QueryRow(ctx, `SELECT `+projectColumns+` FROM projects p WHERE `+where, arg)
	p, err := scanProject(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if err := s.loadProjectRelations(ctx, []*models.Project{p}); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *Store) loadProjectRelations(ctx context.Context, projects []*models.Project) error {
	if len(projects) == 0 {
		return nil
	}
	byID := make(map[string]*models.Project, len(projects))
	ids := make([]string, 0, len(projects))
	for _, p := range projects {
		byID[p.ID] = p
		ids = append(ids, p.ID)
	}

	catRows, err := s.pool.Query(ctx,
		`SELECT project_id, category_id FROM project_categories WHERE project_id = ANY($1)`, ids)
	if err != nil {
		return err
	}
	for catRows.Next() {
		var pid, cid string
		if err := catRows.Scan(&pid, &cid); err != nil {
			catRows.Close()
			return err
		}
		if p := byID[pid]; p != nil {
			p.CategoryIDs = append(p.CategoryIDs, cid)
		}
	}
	catRows.Close()
	if err := catRows.Err(); err != nil {
		return err
	}

	imgRows, err := s.pool.Query(ctx,
		`SELECT id, project_id, url, caption, is_cover, sort_order
		 FROM project_images WHERE project_id = ANY($1)
		 ORDER BY sort_order, id`, ids)
	if err != nil {
		return err
	}
	for imgRows.Next() {
		var pid string
		var img models.ProjectImage
		if err := imgRows.Scan(&img.ID, &pid, &img.URL, &img.Caption, &img.IsCover, &img.SortOrder); err != nil {
			imgRows.Close()
			return err
		}
		if p := byID[pid]; p != nil {
			p.Images = append(p.Images, img)
		}
	}
	imgRows.Close()
	if err := imgRows.Err(); err != nil {
		return err
	}

	techRows, err := s.pool.Query(ctx,
		`SELECT project_id, name FROM project_tech WHERE project_id = ANY($1)
		 ORDER BY sort_order, id`, ids)
	if err != nil {
		return err
	}
	for techRows.Next() {
		var pid, name string
		if err := techRows.Scan(&pid, &name); err != nil {
			techRows.Close()
			return err
		}
		if p := byID[pid]; p != nil {
			p.Tech = append(p.Tech, name)
		}
	}
	techRows.Close()
	return techRows.Err()
}

func (s *Store) CreateProject(ctx context.Context, in models.ProjectInput) (*models.Project, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var id string
	err = tx.QueryRow(ctx,
		`INSERT INTO projects
			(slug, title, summary, description, repo_url, demo_url, demo_type, demo_guide,
			 status, featured, started_on, ended_on, sort_order)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
		 RETURNING id`,
		in.Slug, in.Title, in.Summary, in.Description, in.RepoURL, in.DemoURL, in.DemoType, in.DemoGuide,
		defaultStatus(in.Status), in.Featured, in.StartedOn, in.EndedOn, in.SortOrder,
	).Scan(&id)
	if err != nil {
		return nil, err
	}

	if err := replaceProjectCategories(ctx, tx, id, in.CategoryIDs); err != nil {
		return nil, err
	}
	if err := replaceProjectTech(ctx, tx, id, in.Tech); err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return s.GetProjectByID(ctx, id)
}

func (s *Store) UpdateProject(ctx context.Context, id string, in models.ProjectInput) (*models.Project, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	ct, err := tx.Exec(ctx,
		`UPDATE projects SET
			slug=$2, title=$3, summary=$4, description=$5, repo_url=$6, demo_url=$7,
			demo_type=$8, demo_guide=$9, status=$10, featured=$11,
			started_on=$12, ended_on=$13, sort_order=$14, updated_at=now()
		 WHERE id=$1`,
		id, in.Slug, in.Title, in.Summary, in.Description, in.RepoURL, in.DemoURL,
		in.DemoType, in.DemoGuide, defaultStatus(in.Status), in.Featured,
		in.StartedOn, in.EndedOn, in.SortOrder,
	)
	if err != nil {
		return nil, err
	}
	if ct.RowsAffected() == 0 {
		return nil, ErrNotFound
	}
	if err := replaceProjectCategories(ctx, tx, id, in.CategoryIDs); err != nil {
		return nil, err
	}
	if err := replaceProjectTech(ctx, tx, id, in.Tech); err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return s.GetProjectByID(ctx, id)
}

func (s *Store) DeleteProject(ctx context.Context, id string) error {
	ct, err := s.pool.Exec(ctx, `DELETE FROM projects WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) IncrementProjectView(ctx context.Context, slug string) error {
	_, err := s.pool.Exec(ctx, `UPDATE projects SET view_count = view_count + 1 WHERE slug = $1`, slug)
	return err
}

// ── project images ───────────────────────────────────────────

func (s *Store) AddProjectImage(ctx context.Context, projectID, url, caption string, isCover bool) (*models.ProjectImage, error) {
	var img models.ProjectImage
	err := s.pool.QueryRow(ctx,
		`INSERT INTO project_images (project_id, url, caption, is_cover, sort_order)
		 VALUES ($1,$2,$3,$4, COALESCE((SELECT max(sort_order)+1 FROM project_images WHERE project_id=$1), 0))
		 RETURNING id, url, caption, is_cover, sort_order`,
		projectID, url, caption, isCover,
	).Scan(&img.ID, &img.URL, &img.Caption, &img.IsCover, &img.SortOrder)
	return &img, err
}

func (s *Store) DeleteProjectImage(ctx context.Context, imageID string) error {
	ct, err := s.pool.Exec(ctx, `DELETE FROM project_images WHERE id = $1`, imageID)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) SetProjectCover(ctx context.Context, projectID, imageID string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	if _, err := tx.Exec(ctx, `UPDATE project_images SET is_cover = false WHERE project_id = $1`, projectID); err != nil {
		return err
	}
	ct, err := tx.Exec(ctx, `UPDATE project_images SET is_cover = true WHERE id = $1 AND project_id = $2`, imageID, projectID)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return ErrNotFound
	}
	return tx.Commit(ctx)
}

// ── helpers ──────────────────────────────────────────────────

func defaultStatus(s string) string {
	if s == "published" {
		return "published"
	}
	return "draft"
}

func replaceProjectCategories(ctx context.Context, tx pgx.Tx, projectID string, categoryIDs []string) error {
	if _, err := tx.Exec(ctx, `DELETE FROM project_categories WHERE project_id = $1`, projectID); err != nil {
		return err
	}
	for _, cid := range categoryIDs {
		if cid == "" {
			continue
		}
		if _, err := tx.Exec(ctx,
			`INSERT INTO project_categories (project_id, category_id) VALUES ($1,$2)
			 ON CONFLICT DO NOTHING`, projectID, cid); err != nil {
			return err
		}
	}
	return nil
}

func replaceProjectTech(ctx context.Context, tx pgx.Tx, projectID string, tech []string) error {
	if _, err := tx.Exec(ctx, `DELETE FROM project_tech WHERE project_id = $1`, projectID); err != nil {
		return err
	}
	for i, name := range tech {
		if strings.TrimSpace(name) == "" {
			continue
		}
		if _, err := tx.Exec(ctx,
			`INSERT INTO project_tech (project_id, name, sort_order) VALUES ($1,$2,$3)`,
			projectID, name, i); err != nil {
			return err
		}
	}
	return nil
}
