\c recipeclub;
-- \c recipeclub_test;

DROP TABLE IF EXISTS instructions;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recipe_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS cookbooks;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS users;



CREATE TABLE users (
    username text UNIQUE NOT NULL PRIMARY KEY,
    password text NOT NULL CHECK (LENGTH(password) > 2),
    email text NOT NULL,
    is_admin boolean DEFAULT FALSE,
    is_mute boolean DEFAULT FALSE
);

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    recipe_name text NOT NULL,
    image_url text NOT NULL,
    created_on DATE NOT NULL DEFAULT CURRENT_DATE,
    user_username text NOT NULL REFERENCES users ON DELETE CASCADE
);

CREATE TABLE instructions (
    id SERIAL PRIMARY KEY,
    order_num INTEGER NOT NULL,
    instruction text NOT NULL,
    recipe_id INTEGER REFERENCES recipes ON DELETE CASCADE
);

CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    order_num INTEGER NOT NULL,
    ingredient text NOT NULL,
    recipe_id INTEGER REFERENCES recipes ON DELETE CASCADE
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag_name text UNIQUE NOT NULL
);

CREATE TABLE recipe_tags (
    id SERIAL PRIMARY KEY,
    tag_id INTEGER REFERENCES tags ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes ON DELETE CASCADE
);

CREATE TABLE cookbooks (
    users_username TEXT REFERENCES users ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes ON DELETE CASCADE,
    PRIMARY KEY (users_username, recipe_id)
);


CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    users_username TEXT REFERENCES users ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes ON DELETE CASCADE,
    comment text NOT NULL,
    created_on DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE ratings (
    users_username TEXT REFERENCES users ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes ON DELETE CASCADE,
    score INTEGER NOT NULL,
    CHECK (score >= 0 AND score <= 5),
    PRIMARY KEY (users_username, recipe_id)
);

INSERT INTO users (username, password, email, is_admin)
VALUES ( 'admin', '$2b$12$nhJHieoFEnLYbXVAo1BbEezN0wmY/klGFn/qbeRFoUvp7aEgmzsuu', 'email', true );

-- ALTER TABLE users 
-- ADD users_recipes REFERENCES recipes ON DELETE CASCADE,
--     users_cookbook REFERENCES cookbook ON DELETE CASCADE;