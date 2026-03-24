const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const journalController = require("../controllers/journalController");

router.use(authenticate);

// POST /api/journals — Create journal entry
router.post(
  "/",
  [
    body("body").notEmpty().withMessage("Journal body is required"),
    body("visibility").optional().isIn(["private", "circle", "public"]),
    body("mood_value").optional().isInt({ min: 1, max: 5 }),
    validate,
  ],
  journalController.create
);

// GET /api/journals — Get all entries
router.get("/", journalController.getAll);

// GET /api/journals/:id — Get single entry
router.get("/:id", journalController.getById);

// PUT /api/journals/:id — Update entry
router.put(
  "/:id",
  [
    body("body").optional().notEmpty(),
    body("visibility").optional().isIn(["private", "circle", "public"]),
    body("mood_value").optional().isInt({ min: 1, max: 5 }),
    validate,
  ],
  journalController.update
);

// DELETE /api/journals/:id — Delete entry
router.delete("/:id", journalController.delete);

module.exports = router;
