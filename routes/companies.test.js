
process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany

beforeEach(async function () {
    let result = await db.query(`
    INSERT INTO
      companies (code, name, description) VALUES ('tc', 'Test Inc', 'Testing all the competitors!')
      RETURNING code, name, description`);
    testCompany = result.rows[0];
});


afterEach(async function () {
    await db.query("DELETE FROM companies");
});

afterAll(async function () {
    // close db connection
    await db.end();
});


describe("GET /companies", function () {
    test("Gets a list of all companies", async function () {
        const resp = await request(app).get(`/companies`)
        expect(resp.statusCode).toBe(200);
        expect(resp.body.companies).toContainEqual([testCompany]);

    });
});


describe("GET /companies/code", function () {
    test("Gets a company by code", async function () {
        const resp = await request(app).get(`/companies/tc`)
        expect(resp.statusCode).toBe(200);
        expect(resp.body.company).toEqual({ "code": "tc", "description": "Testing all the competitors!", "invoices": [], "name": "Test Inc" });
        const resp2 = await request(app).get(`/companies/tccxcxcxcx`)
        expect(resp2.statusCode).toBe(404);
        expect(resp2.body.error.message).toContain("Sorry");
    });
});

describe("POST /companies/", function () {
    test("Posts a new company", async function () {
        const resp = await request(app).post(`/companies/`).send({ "code": "ex", "name": "example Inc", "description": "Setting an example" })
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({ "code": "ex", "name": "example Inc", "description": "Setting an example" });
        const resp2 = await request(app).post(`/companies/`).send({ "LOL": "Lol" })
        expect(resp2.statusCode).toBe(422);
        expect(resp2.body.error.message).toEqual("Pleaser enter Data in right format");
        const resp3 = await request(app).post(`/companies/`).send([])
        expect(resp3.statusCode).toBe(400);
        expect(resp3.body.error.message).toEqual("Please enter data");
    });
});


describe("DELETE /companies/code", function () {
    test("Deletes a company by code", async function () {
        const resp = await request(app).delete(`/companies/tc`)
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"status":"deleted"});
        const resp2 = await request(app). delete('/companies/lol')
        expect(resp2.statusCode).toBe(404)
        expect(resp2.body.error.message).toContain("Sorry couldnt find results for code")
       
    });
});


describe("PUT /companies/code", function () {
    test("Updates a company by code", async function () {
        const resp = await request(app).put(`/companies/tc`).send({"name": "screwing Inc", "description": "lol"})
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({"code": "tc", "name": "screwing Inc", "description": "lol"});
        const resp2 = await request(app).put('/companies/lol').send({"name": "screwing Inc", "description": "lol"})
        expect(resp2.statusCode).toBe(404)
        expect(resp2.body.error.message).toContain("Sorry couldnt find results for code")
        const resp3 = await request(app).put('/companies/lol').send([])
        expect(resp3.statusCode).toBe(400)
        expect(resp3.body.error.message).toBe("Please enter data")
        const resp4 = await request(app).put(`/companies/tc`).send({ "LOL": "Lol" })
        expect(resp4.statusCode).toBe(400);
        expect(resp4.body.error.message).toEqual("Pleaser enter Data in right format");
    });
});