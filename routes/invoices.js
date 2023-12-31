const express = require("express");
const router = new express.Router();
const db = require('../db')
const ExpressError = require("../expressError");
router.use(express.json())



router.get("/", async function (req, res) {

    const results = await db.query("SELECT * FROM invoices")

    return res.json({ invoices: [results.rows] });
});


router.get("/:id", async function (req, res, next) {
    try {
        const id = req.params.id
        const result = await db.query("SELECT * FROM invoices WHERE id=$1", [id])
        if (result.rows.length == 0) {
            throw new ExpressError(`Sorry couldnt find results for id "${id}"`, 404)
        }
        const invoice = result.rows[0]
        const code = invoice["comp_code"]
        
        const company = await db.query("SELECT * FROM companies WHERE code = $1", [code])
        return res.json({ invoice: {id: invoice["id"], amt: invoice["amt"],paid: invoice["paid"],
         add_date: invoice["add_date"], paid_date: invoice["paid_date"], company: company.rows[0]  }});
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
        const { comp_code, amt } = req.body

        if (!comp_code || !amt) {
            throw new ExpressError("Pleaser enter Data in right format", 400)
        }
        const add_date = Date.now()
        console.log(add_date)
        const result = await db.query("INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ($1, $2, false, null) RETURNING id, comp_code, amt, paid, add_date, paid_date ", [comp_code, amt])

        return res.status(201).json({invoice: result.rows[0]});
    }
    catch (e) {
        next(e)
    }
});

router.delete("/:id", async function (req, res, next) {
    try {
        const id = req.params.id

        const result = await db.query("DELETE FROM invoices WHERE id=$1 RETURNING id, comp_code", [id])
        if (result.rows.length == 0) {
            throw new ExpressError(`Sorry couldnt find results for code "${id}"`, 404)
        }
        return res.json({ status: "deleted"});
    }
    catch (e) {
        next(e)
    }
});

router.put("/:id", async function (req, res, next) {

    try {
        if (req.body.length == 0 || !req.body) {
            throw new ExpressError("Please enter data", 400)
        }
        const { amt, paid } = req.body
        const id = req.params.id

        if (!id || !amt) {
            throw new ExpressError("Pleaser enter Data in right format", 400)
        }

       if (paid==undefined){
        const result = await db.query("UPDATE invoices SET amt =$1 WHERE id =$2 RETURNING id, comp_code, amt, paid, add_date, paid_date", [amt, id])
        if (result.rows.length == 0) {
            throw new ExpressError(`Sorry couldnt find results for code "${code}"`, 404)
        }
        return res.status(201).json({invoice: result.rows[0]});}
        else {
            let paid_date 
            if (paid == true){
                paid_date = new Date(Date.now())
            }
            else if (paid == false){
                paid_date = null
            }
            const result = await db.query("UPDATE invoices SET amt =$1, paid=$2, paid_date=$3 WHERE id =$4 RETURNING id, comp_code, amt, paid, add_date, paid_date", [amt, paid, paid_date, id])
        if (result.rows.length == 0) {
            throw new ExpressError(`Sorry couldnt find results for code "${code}"`, 404)
        }
        return res.status(201).json({invoice: result.rows[0]});
            
        }
    }
    catch (e) {
        next(e)
    }
});




module.exports = router;