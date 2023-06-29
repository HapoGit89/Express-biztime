const express = require("express");
const router = new express.Router();
const db = require('../db')
const ExpressError = require("../expressError");
router.use(express.json())
const slug = require("slugify")



router.get("/", async function (req, res) {

    const results = await db.query("SELECT * FROM companies")

    return res.json({ companies: [results.rows] });
});


router.get("/:code", async function (req, res, next) {
    try {
        const code = req.params.code
        const result = await db.query("SELECT * FROM companies WHERE code=$1", [code])
        if (result.rows.length == 0) {
            throw new ExpressError(`Sorry couldnt find results for code "${code}"`, 404)
        }
        const company = result.rows[0]
        const comp_code = company["code"]
        const result2 = await db.query("SELECT * FROM invoices WHERE comp_code = $1", [comp_code])
        return res.json({ company: { code: company["code"], name: company["name"], description: company["description"], invoices: result2.rows } });
    }
    catch (e) {
        next(e)
    }
});

router.post("/", async function (req, res, next) {
    try {
        if (req.body.length == 0 || !req.body) {
            throw new ExpressError("Please enter data", 400)
        }
        const { code, name, description } = req.body

        const slugcode = slug(code,{remove: /[*+~.()'"$!:@]/, replacement: '_', strict: true, lower: true, trim: true})

        if (!code || !name || !description) {
            throw new ExpressError("Pleaser enter Data in right format", 422)
        }

        const result = await db.query("INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description", [slugcode, name, description])

        return res.status(201).json(result.rows[0]);
    }
    catch (e) {
        next(e)
    }
});

router.delete("/:code", async function (req, res, next) {
    try {
        const code = req.params.code
        const result = await db.query("DELETE FROM companies WHERE code=$1 RETURNING code, name, description", [code])
        if (result.rows.length == 0) {
            // return res.status(404).json({message: "Sorry couldnt ....."})
            throw new ExpressError(`Sorry couldnt find results for code "${code}"`, 404)
        }
        return res.json({"status": "deleted"});
    }
    catch (e) {
        next(e)
    }
});

router.put("/:code", async function (req, res, next) {

    try {
        if (req.body.length == 0 || !req.body) {
            throw new ExpressError("Please enter data", 400)
        }
        const { name, description } = req.body
        const code = req.params.code

        if (!name || !description) {
            throw new ExpressError("Pleaser enter Data in right format", 400)
        }

        const result = await db.query("UPDATE companies SET name = $1, description=$2 where code =$3 RETURNING code, name, description", [name, description, code])
        if (result.rows.length == 0) {
            throw new ExpressError(`Sorry couldnt find results for code "${code}"`, 404)
        }
        return res.status(201).json(result.rows[0]);
    }
    catch (e) {
        next(e)
    }
});




module.exports = router;