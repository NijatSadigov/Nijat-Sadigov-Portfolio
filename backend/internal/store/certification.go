package store

import (
	"context"

	"github.com/jackc/pgx/v5"

	"portfolio/internal/models"
)

const certColumns = `id, title, issuer, description, credential_url, cover_image_url,
	issued_on, expires_on, sort_order`

func scanCert(row pgx.Row) (*models.Certification, error) {
	var c models.Certification
	if err := row.Scan(&c.ID, &c.Title, &c.Issuer, &c.Description, &c.CredentialURL,
		&c.CoverImageURL, &c.IssuedOn, &c.ExpiresOn, &c.SortOrder); err != nil {
		return nil, err
	}
	c.CategoryIDs = []string{}
	c.Images = []models.CertImage{}
	return &c, nil
}

func (s *Store) ListCertifications(ctx context.Context) ([]models.Certification, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT `+certColumns+` FROM certifications ORDER BY sort_order, issued_on DESC NULLS LAST`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*models.Certification
	ids := []string{}
	for rows.Next() {
		c, err := scanCert(rows)
		if err != nil {
			return nil, err
		}
		list = append(list, c)
		ids = append(ids, c.ID)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	links, err := s.loadCategoryLinks(ctx, "certification_categories", "certification_id", ids)
	if err != nil {
		return nil, err
	}
	if err := s.loadCertImages(ctx, list, ids); err != nil {
		return nil, err
	}

	out := make([]models.Certification, len(list))
	for i, c := range list {
		if cats := links[c.ID]; cats != nil {
			c.CategoryIDs = cats
		}
		out[i] = *c
	}
	return out, nil
}

func (s *Store) loadCertImages(ctx context.Context, certs []*models.Certification, ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	byID := make(map[string]*models.Certification, len(certs))
	for _, c := range certs {
		byID[c.ID] = c
	}
	rows, err := s.pool.Query(ctx,
		`SELECT id, certification_id, url, caption, is_cover, sort_order
		 FROM certification_images WHERE certification_id = ANY($1)
		 ORDER BY sort_order, id`, ids)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var cid string
		var img models.CertImage
		if err := rows.Scan(&img.ID, &cid, &img.URL, &img.Caption, &img.IsCover, &img.SortOrder); err != nil {
			return err
		}
		if c := byID[cid]; c != nil {
			c.Images = append(c.Images, img)
		}
	}
	return rows.Err()
}

func (s *Store) CreateCertification(ctx context.Context, in models.CertificationInput) (string, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	var id string
	if err := tx.QueryRow(ctx,
		`INSERT INTO certifications
			(title, issuer, description, credential_url, cover_image_url, issued_on, expires_on, sort_order)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
		in.Title, in.Issuer, in.Description, in.CredentialURL, in.CoverImageURL,
		in.IssuedOn, in.ExpiresOn, in.SortOrder,
	).Scan(&id); err != nil {
		return "", err
	}
	if err := replaceCategoryLinks(ctx, tx, "certification_categories", "certification_id", id, in.CategoryIDs); err != nil {
		return "", err
	}
	return id, tx.Commit(ctx)
}

func (s *Store) UpdateCertification(ctx context.Context, id string, in models.CertificationInput) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	ct, err := tx.Exec(ctx,
		`UPDATE certifications SET
			title=$2, issuer=$3, description=$4, credential_url=$5, cover_image_url=$6,
			issued_on=$7, expires_on=$8, sort_order=$9
		 WHERE id=$1`,
		id, in.Title, in.Issuer, in.Description, in.CredentialURL, in.CoverImageURL,
		in.IssuedOn, in.ExpiresOn, in.SortOrder)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return ErrNotFound
	}
	if err := replaceCategoryLinks(ctx, tx, "certification_categories", "certification_id", id, in.CategoryIDs); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (s *Store) DeleteCertification(ctx context.Context, id string) error {
	return s.deleteByID(ctx, "certifications", id)
}

func (s *Store) AddCertImage(ctx context.Context, certID, url, caption string, isCover bool) (*models.CertImage, error) {
	var img models.CertImage
	err := s.pool.QueryRow(ctx,
		`INSERT INTO certification_images (certification_id, url, caption, is_cover, sort_order)
		 VALUES ($1,$2,$3,$4, COALESCE((SELECT max(sort_order)+1 FROM certification_images WHERE certification_id=$1), 0))
		 RETURNING id, url, caption, is_cover, sort_order`,
		certID, url, caption, isCover,
	).Scan(&img.ID, &img.URL, &img.Caption, &img.IsCover, &img.SortOrder)
	return &img, err
}

func (s *Store) DeleteCertImage(ctx context.Context, imageID string) error {
	return s.deleteByID(ctx, "certification_images", imageID)
}
