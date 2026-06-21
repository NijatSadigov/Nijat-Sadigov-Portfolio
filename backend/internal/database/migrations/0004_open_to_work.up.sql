-- "Open to work" toggle shown as a badge in the hero.
ALTER TABLE profile ADD COLUMN open_to_work BOOLEAN NOT NULL DEFAULT false;
