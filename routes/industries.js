const express = require("express");
const router = new express.Router();
const db = require('../db')
const ExpressError = require("../expressError");
router.use(express.json())
const slug = require("slugify")


router.get("/", async function (req, res) {
    const results1 = await db.query("SELECT * FROM industries")
    const results2 = await db.query("SELECT i.code as industry_code, c.code as company_code FROM industries as i LEFT JOIN industries_companies as ic ON i.code = ic.ind_code LEFT JOIN companies as c ON c.code = ic.comp_code")
    console.log(results2.rows)
    console.log(results1.rows)
    results1.rows.forEach(function (el1) {
        el1.companies = []
        results2.rows.forEach(function (el2) {
            if (el2.industry_code == el1.code) {
                console.log(el1.companies)
                console.log(el2.company_code)
                el1["companies"].push(el2.company_code)
            }
        })
    })
    return res.json({ industries: results1.rows });
});

router.post("/", async function (req, res, next) {
    try {
        if (req.body.length == 0 || !req.body) {
            throw new ExpressError("Please enter data", 400)
        }
        const { code, industry} = req.body

        const slugcode = slug(code,{remove: /[*+~.()'"$!:@]/, replacement: '_', strict: true, lower: true, trim: true})

        if (!code || !industry) {
            throw new ExpressError("Pleaser enter Data in right format", 422)
        }

        const result = await db.query("INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry", [slugcode, industry])
        if (result.length == 0){
            return res.status(400).json("Sorry this industry is already in the DB")
        }
        return res.status(201).json(result.rows[0]);
    }
    catch (e) {
        next(e)
    }
});


router.post("/companies", async function (req, res, next) {
    try {
        if (req.body.length == 0 || !req.body) {
            throw new ExpressError("Please enter data", 400)
        }
        const { comp_code, ind_code} = req.body

       

        if (!comp_code || !ind_code) {
            throw new ExpressError("Pleaser enter Data in right format", 422)
        }

        const result = await db.query("INSERT INTO industries_companies (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code", [comp_code, ind_code])
        if (result.length == 0){
            return res.status(400).json("Sorry this company/industry relation is already in the DB")
        }
        return res.status(201).json(result.rows[0]);
    }
    catch (e) {
        next(e)
    }
});

module.exports = router;

