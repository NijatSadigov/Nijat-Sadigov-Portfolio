package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// loadCategoryLinks returns entityID → []categoryID for a M2M join table.
// joinTable/fkCol are code constants (never user input), so formatting is safe.
func (s *Store) loadCategoryLinks(ctx context.Context, joinTable, fkCol string, ids []string) (map[string][]string, error) {
	out := map[string][]string{}
	if len(ids) == 0 {
		return out, nil
	}
	q := fmt.Sprintf(`SELECT %s, category_id FROM %s WHERE %s = ANY($1)`, fkCol, joinTable, fkCol)
	rows, err := s.pool.Query(ctx, q, ids)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var entityID, catID string
		if err := rows.Scan(&entityID, &catID); err != nil {
			return nil, err
		}
		out[entityID] = append(out[entityID], catID)
	}
	return out, rows.Err()
}

func replaceCategoryLinks(ctx context.Context, tx pgx.Tx, joinTable, fkCol, entityID string, categoryIDs []string) error {
	if _, err := tx.Exec(ctx, fmt.Sprintf(`DELETE FROM %s WHERE %s = $1`, joinTable, fkCol), entityID); err != nil {
		return err
	}
	for _, cid := range categoryIDs {
		if cid == "" {
			continue
		}
		if _, err := tx.Exec(ctx,
			fmt.Sprintf(`INSERT INTO %s (%s, category_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, joinTable, fkCol),
			entityID, cid); err != nil {
			return err
		}
	}
	return nil
}
