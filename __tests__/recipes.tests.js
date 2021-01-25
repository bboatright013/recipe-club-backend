process.env.NODE_ENV = "test";


// npm packages
const request = require("supertest");
const bcrypt = require("bcrypt");

// app imports
const app = require("../app");
const db = require("../db");

TEST_ADMIN = {};
TEST_USER = {};

beforeAll(async function(){
    //Get admin credentials
    const hashedPassword1 = await bcrypt.hash("admin", 1);
    await db.query(
        `INSERT INTO users (username, password, email, is_admin, is_mute)
                    VALUES ('admin', $1, 'admin@gmail.com', true, false)`,
        [hashedPassword1]
    );
    const response = await request(app)
    .post("/login")
    .send({
      username: "admin",
      password: "admin",
    });
    TEST_ADMIN._userToken = response.body.token;

    //Get standard user credentials
    const hashedPassword = await bcrypt.hash("secret", 1);
    await db.query(
        `INSERT INTO users (username, password, email)
                    VALUES ('test', $1, 'test@gmail.com')`,
        [hashedPassword]
    );
    const secondResponse = await request(app)
    .post("/login")
    .send({
        username: "test",
        password: "secret",
    });
    TEST_USER._userToken = secondResponse.body.token;
});

beforeEach(async function(){
    await db.query(
        `INSERT INTO recipes (id, recipe_name, image_url, user_username)
        VALUES (999, 'pizza', 'pictureOfPizza', 'admin')`
    );
    await db.query(
        `INSERT INTO ingredients (id, order_num, ingredient, recipe_id)
        VALUES (999, 1, 'dough', 999)`
    );
    await db.query(
        `INSERT INTO instructions (id, order_num, instruction, recipe_id)
        VALUES (999, 1, 'knead the dough', 999)`
    );
});

afterEach(async function(){
    await db.query(`DELETE FROM recipes`);
})



describe("/recipes", function(){
    test("POST /recipes", async function(){
        const response = await request(app)
        .post("/recipes")
        .send({"_userToken": `${TEST_ADMIN._userToken}`,
            "recipe_name": "rice",
        "image_url": "image_url",
        "instructionsArray": [
            {"order_num" : "1",
            "instruction": "first instruction"}
        ],
        "ingredientsArray": [
            {"order_num" : "1",
            "ingredient": "first ingredient"}
        ]
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("recipe");
    });

    test("GET", async function(){
        const response = await request(app)
        .get("/recipes");
        expect(response.body).toHaveProperty("recipes");
        expect(response.statusCode).toBe(200);
    });

    test("GET/:recipeId", async function(){
        const response = await request(app)
        .get("/recipes/999");
        expect(response.body).toHaveProperty("recipe");
        expect(response.statusCode).toBe(200);
    });

    test("DELETE/:id", async function(){
        const response = await request(app)
        .delete(`/recipes/999`)
        .send({"_userToken": `${TEST_ADMIN._userToken}`});
        expect(response.body).toHaveProperty("msg");
    });


    test("PATCH", async function(){

        const response = await request(app)
        .patch(`/recipes/999`)
        .send({"_userToken": `${TEST_ADMIN._userToken}`,
        "recipe_name": "pizza dough",
        "image_url": "betterPizzaPic",
        "ingredients": [
        {
            "id": 999,
            "order_num": 1,
            "ingredient": "yeast activated dough",
            "recipe_id": 999
        }],
        "instructions": [
        {
            "id": 999,
            "order_num": 1,
            "instruction": "knead dough into pie shape",
            "recipe_id": 999
        }]
        });
        console.log("response:", response.body);
        expect(response.body).toHaveProperty("updatedInstructions");
        expect(response.body).toHaveProperty("updatedIngredients");

        expect(response.statusCode).toBe(200);
    });

});


afterAll(async function() {
    try {
        await db.query("DELETE FROM users");
        await db.query("DELETE FROM recipes");
        await db.end();
    } catch (err) {
        console.error(err);
    }
  });