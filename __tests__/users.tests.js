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
    await db.query("DELETE FROM users");

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
})


describe("/users", function(){
    test("GET /users Admin can get user list", async function() {
        
        const response = await request(app).get("/users")
        .send({_userToken: `${TEST_ADMIN._userToken}`});
        expect(response.statusCode).toBe(200);
    });

    test("GET /users/:user as user", async function() {

        const response = await request(app)
        .get("/users/test")
        .send({_userToken: `${TEST_USER._userToken}`});

        expect(response.statusCode).toBe(200);
    });

    test("PATCH /users/:user test user", async function() {
        const response = await request(app)
        .patch("/users/test")
        .send({_userToken: `${TEST_USER._userToken}`,
        update: {
            email: "moretesty@email.com"
        }});

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("user");
    });

    test("DELETE /users/:user deletes user", async function() {
        const response = await request(app)
        .delete("/users/test")
        .send({_userToken: `${TEST_USER._userToken}`});


        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message");

    });
});

afterAll(async function() {
    try {
        await db.query("DELETE FROM users");
        await db.end();
    } catch (err) {
        console.error(err);
    }
  });