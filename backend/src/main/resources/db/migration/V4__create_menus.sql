CREATE TABLE menus (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    date_created DATE NOT NULL DEFAULT CURRENT_DATE,
    guest_count  INT NOT NULL DEFAULT 4,
    recipe_ids   JSONB NOT NULL DEFAULT '[]'
);
