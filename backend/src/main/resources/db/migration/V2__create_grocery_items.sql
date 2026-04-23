CREATE TABLE grocery_items (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id   UUID        REFERENCES recipes(id) ON DELETE SET NULL,
    label       TEXT        NOT NULL,
    checked     BOOLEAN     NOT NULL DEFAULT false,
    added_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);
