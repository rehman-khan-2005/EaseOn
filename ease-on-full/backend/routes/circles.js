const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const circleController = require("../controllers/circleController");

router.use(authenticate);

// POST /api/circles — Create a new circle
router.post(
  "/",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Circle name required (2-100 chars)"),
    body("description").optional().isString(),
    body("visibility").optional().isIn(["public", "private", "invite_only"]),
    validate,
  ],
  circleController.create
);

// GET /api/circles — Browse all circles
router.get("/", circleController.getAll);

// GET /api/circles/joined — Get user's joined circles
router.get("/joined", circleController.getJoined);

// GET /api/circles/:id — Get circle detail with members
router.get("/:id", circleController.getById);

// POST /api/circles/:id/join — Join a circle
router.post("/:id/join", circleController.join);

// POST /api/circles/:id/leave — Leave a circle
router.post("/:id/leave", circleController.leave);

// PUT /api/circles/:id/members — Update member role (admin only)
router.put(
  "/:id/members",
  [
    body("target_user_id").isUUID(),
    body("role").isIn(["admin", "moderator", "member"]),
    validate,
  ],
  circleController.updateMemberRole
);

module.exports = router;
