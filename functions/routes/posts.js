const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const postController = require("../controllers/postController");

router.use(authenticate);

router.post("/", [body("text").notEmpty(), validate], postController.create);
router.get("/", postController.getAll);
router.get("/mine", postController.getByUser);
router.get("/user/:userId", postController.getByUser);
router.get("/:id", postController.getById);
router.post("/:id/like", postController.like);
router.post("/:id/unlike", postController.unlike);
router.post("/:id/comments", [body("text").notEmpty(), validate], postController.addComment);
router.delete("/:id", postController.delete);

module.exports = router;
