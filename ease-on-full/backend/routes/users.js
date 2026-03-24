const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const userController = require("../controllers/userController");

// ─── Public Routes ──────────────────────────────────────────────────

// POST /api/users/register
router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 3, max: 50 }).withMessage("Username must be 3-50 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    validate,
  ],
  userController.register
);

// POST /api/users/login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
    validate,
  ],
  userController.login
);

// POST /api/users/firebase-auth (exchange Firebase token for app token)
router.post("/firebase-auth", authenticate, userController.firebaseAuth);

// ─── Protected Routes ───────────────────────────────────────────────

// GET /api/users/me
router.get("/me", authenticate, userController.getProfile);

// PUT /api/users/me
router.put("/me", authenticate, userController.updateProfile);

// GET /api/users/top-contributors
router.get("/top-contributors", authenticate, userController.getTopContributors);

// GET /api/users/:id
router.get("/:id", authenticate, userController.getProfile);

module.exports = router;
