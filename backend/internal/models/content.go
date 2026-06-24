package models

import "time"

// ── Skills ──
type Skill struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Level       int      `json:"level"`
	Icon        string   `json:"icon"`
	SortOrder   int      `json:"sortOrder"`
	CategoryIDs []string `json:"categoryIds"`
}

type SkillInput struct {
	Name        string   `json:"name"`
	Level       int      `json:"level"`
	Icon        string   `json:"icon"`
	SortOrder   int      `json:"sortOrder"`
	CategoryIDs []string `json:"categoryIds"`
}

// ── Certifications ──
type CertImage struct {
	ID        string `json:"id"`
	URL       string `json:"url"`
	Caption   string `json:"caption"`
	IsCover   bool   `json:"isCover"`
	SortOrder int    `json:"sortOrder"`
}

type Certification struct {
	ID            string      `json:"id"`
	Title         string      `json:"title"`
	Issuer        string      `json:"issuer"`
	Description   string      `json:"description"`
	CredentialURL string      `json:"credentialUrl"`
	CoverImageURL string      `json:"coverImageUrl"`
	IssuedOn      *time.Time  `json:"issuedOn"`
	ExpiresOn     *time.Time  `json:"expiresOn"`
	SortOrder     int         `json:"sortOrder"`
	CategoryIDs   []string    `json:"categoryIds"`
	Images        []CertImage `json:"images"`
}

type CertificationInput struct {
	Title         string     `json:"title"`
	Issuer        string     `json:"issuer"`
	Description   string     `json:"description"`
	CredentialURL string     `json:"credentialUrl"`
	CoverImageURL string     `json:"coverImageUrl"`
	IssuedOn      *time.Time `json:"issuedOn"`
	ExpiresOn     *time.Time `json:"expiresOn"`
	SortOrder     int        `json:"sortOrder"`
	CategoryIDs   []string   `json:"categoryIds"`
}

// ── Achievements ──
type Achievement struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	AchievedOn  *time.Time `json:"achievedOn"`
	SortOrder   int        `json:"sortOrder"`
	CategoryIDs []string   `json:"categoryIds"`
}

type AchievementInput struct {
	Title       string     `json:"title"`
	Description string     `json:"description"`
	AchievedOn  *time.Time `json:"achievedOn"`
	SortOrder   int        `json:"sortOrder"`
	CategoryIDs []string   `json:"categoryIds"`
}

// ── Education (global) ──
type Education struct {
	ID          string     `json:"id"`
	Institution string     `json:"institution"`
	Degree      string     `json:"degree"`
	Field       string     `json:"field"`
	Description string     `json:"description"`
	Location    string     `json:"location"`
	StartDate   *time.Time `json:"startDate"`
	EndDate     *time.Time `json:"endDate"`
	IsCurrent   bool       `json:"isCurrent"`
	SortOrder   int        `json:"sortOrder"`
}

// ── Work experience (global) ──
type Experience struct {
	ID             string     `json:"id"`
	Company        string     `json:"company"`
	Role           string     `json:"role"`
	Location       string     `json:"location"`
	Description    string     `json:"description"`
	StartDate      *time.Time `json:"startDate"`
	EndDate        *time.Time `json:"endDate"`
	IsCurrent      bool       `json:"isCurrent"`
	SortOrder      int        `json:"sortOrder"`
	ReferenceURL   string     `json:"referenceUrl"`
	ReferenceLabel string     `json:"referenceLabel"`
}

// ── Résumés ──
type Resume struct {
	ID         string    `json:"id"`
	CategoryID *string   `json:"categoryId"`
	Label      string    `json:"label"`
	FileURL    string    `json:"fileUrl"`
	IsMain     bool      `json:"isMain"`
	UploadedAt time.Time `json:"uploadedAt"`
}

type ResumeInput struct {
	CategoryID *string `json:"categoryId"`
	Label      string  `json:"label"`
	FileURL    string  `json:"fileUrl"`
	IsMain     bool    `json:"isMain"`
}

// ── Contact ──
type ContactMessage struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"isRead"`
	CreatedAt time.Time `json:"createdAt"`
}

type ContactInput struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}
