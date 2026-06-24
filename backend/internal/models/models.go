package models

import "time"

type Profile struct {
	FullName   string    `json:"fullName"`
	Headline   string    `json:"headline"`
	Bio        string    `json:"bio"`
	PhotoURL   string    `json:"photoUrl"`
	Email      string    `json:"email"`
	Phone      string    `json:"phone"`
	Location   string    `json:"location"`
	OpenToWork bool      `json:"openToWork"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type SocialLink struct {
	ID        string `json:"id"`
	Platform  string `json:"platform"`
	Label     string `json:"label"`
	URL       string `json:"url"`
	Icon      string `json:"icon"`
	SortOrder int    `json:"sortOrder"`
}

type Category struct {
	ID          string `json:"id"`
	Slug        string `json:"slug"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Theme       string `json:"theme"`
	AccentColor string `json:"accentColor"`
	SortOrder   int    `json:"sortOrder"`
}

type ProjectImage struct {
	ID        string `json:"id"`
	URL       string `json:"url"`
	Caption   string `json:"caption"`
	IsCover   bool   `json:"isCover"`
	SortOrder int    `json:"sortOrder"`
}

type Project struct {
	ID          string         `json:"id"`
	Slug        string         `json:"slug"`
	Title       string         `json:"title"`
	Summary     string         `json:"summary"`
	Description string         `json:"description"`
	RepoURL     string         `json:"repoUrl"`
	DemoURL     string         `json:"demoUrl"`
	DemoType    string         `json:"demoType"`
	DemoGuide   string         `json:"demoGuide"`
	Status      string         `json:"status"`
	Featured    bool           `json:"featured"`
	ViewCount   int            `json:"viewCount"`
	StartedOn   *time.Time     `json:"startedOn"`
	EndedOn     *time.Time     `json:"endedOn"`
	SortOrder   int            `json:"sortOrder"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	CategoryIDs []string       `json:"categoryIds"`
	Images      []ProjectImage `json:"images"`
	Tech        []string       `json:"tech"`
}

type ProjectInput struct {
	Slug        string     `json:"slug"`
	Title       string     `json:"title"`
	Summary     string     `json:"summary"`
	Description string     `json:"description"`
	RepoURL     string     `json:"repoUrl"`
	DemoURL     string     `json:"demoUrl"`
	DemoType    string     `json:"demoType"`
	DemoGuide   string     `json:"demoGuide"`
	Status      string     `json:"status"`
	Featured    bool       `json:"featured"`
	StartedOn   *time.Time `json:"startedOn"`
	EndedOn     *time.Time `json:"endedOn"`
	SortOrder   int        `json:"sortOrder"`
	CategoryIDs []string   `json:"categoryIds"`
	Tech        []string   `json:"tech"`
}
