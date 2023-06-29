const express = require("express");
const router = new express.Router();
const db = require('../db')
const ExpressError = require("../expressError");
router.use(express.json())


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



module.exports = router;

