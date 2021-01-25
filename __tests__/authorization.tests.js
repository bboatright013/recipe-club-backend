process.env.NODE_ENV = "test";


// npm packages
const request = require("supertest");
const bcrypt = require("bcrypt");

// app imports
const app = require("../app");
const db = require("../db");

beforeAll(async function(){
    const hashedPassword = await bcrypt.hash("secret", 1);
        await db.query(
            `INSERT INTO users (username, password, email)
                        VALUES ('test', $1, 'test@gmail.com')`,
            [hashedPassword]
        );
});


describe("/register", function () {
    test("POST /register Creates a new user", async function () {
        const response = await request(app)
            .post("/register")
            .send({
            username: "test_user",
            password: "test_password",
            email: "test@email.com"
            });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
    });

    test("POST /register Denies duplicate username", async function(){
        const response = await request(app)
            .post("/register")
            .send({
            username: "test",
            password: "test_password",
            email: "test@email.com"
            });
        expect(response.statusCode).toBe(400);
    });

});


describe("/login", function (){
    test("POST /login logs in test user", async function(){
        const response = await request(app).post("/login").send(
            {username:"test",
            password:"secret"});
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
    });
    test("POST /login fails to log in a user", async function(){
        const response = await request(app).post("/login").send(
            {username:"testes",
            password:"secret"});
        expect(response.statusCode).toBe(401);
    })
});


afterAll(async function() {
    try {
        await db.query("DELETE FROM users");
        await db.end();
    } catch (err) {
        console.error(err);
    }
  });