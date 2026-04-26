ALTER TABLE recipes ADD COLUMN instructions TEXT;
UPDATE recipes SET instructions = array_to_string(steps, E'\n') WHERE steps IS NOT NULL;
ALTER TABLE recipes DROP COLUMN steps;
