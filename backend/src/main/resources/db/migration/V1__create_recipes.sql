CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE recipes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           TEXT        NOT NULL,
    description     TEXT,
    servings        INT,
    prep_time       TEXT,
    cook_time       TEXT,
    tags            TEXT[],
    ingredients     JSONB,
    steps           TEXT[],
    source          TEXT,
    prep_ahead_note TEXT,
    date_added      DATE        NOT NULL DEFAULT CURRENT_DATE
);
