-- Lets a work-experience entry link a reference letter / internship certificate.
ALTER TABLE work_experience ADD COLUMN reference_url   TEXT NOT NULL DEFAULT '';
ALTER TABLE work_experience ADD COLUMN reference_label TEXT NOT NULL DEFAULT '';
