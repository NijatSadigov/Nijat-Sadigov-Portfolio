INSERT INTO profile (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (slug, name, description, theme, accent_color, sort_order) VALUES
    ('game',     'Game Development',     'Games, engines, and interactive media.',  'pixel',    '#22c55e', 1),
    ('software', 'Software Development', 'Backend, web, and systems engineering.',   'default',  '#6366f1', 2),
    ('research', 'Academic Research',    'Papers, experiments, and academic work.',  'research', '#0ea5e9', 3)
ON CONFLICT (slug) DO NOTHING;
