const postService = require("../services/postService");
const userService = require("../services/userService");
const notificationService = require("../services/notificationService");

class PostController {
  async create(req, res, next) {
    try {
      const post = await postService.create(req.user.id, req.body);
      await userService.awardKarma(req.user.id, 2);
      res.status(201).json(post);
    } catch (e) { next(e); }
  }
  async getAll(req, res, next) {
    try {
      const { page, limit, circle_tag } = req.query;
      const result = await postService.getAll({ page: +page || 1, limit: +limit || 20, circle_tag });
      res.json(result);
    } catch (e) { next(e); }
  }
  async getById(req, res, next) {
    try { res.json(await postService.getById(req.params.id)); } catch (e) { next(e); }
  }
  async getByUser(req, res, next) {
    try { res.json(await postService.getByUser(req.params.userId || req.user.id)); } catch (e) { next(e); }
  }
  async like(req, res, next) {
    try { res.json(await postService.like(req.params.id)); } catch (e) { next(e); }
  }
  async unlike(req, res, next) {
    try { res.json(await postService.unlike(req.params.id)); } catch (e) { next(e); }
  }
  async addComment(req, res, next) {
    try {
      const comment = await postService.addComment(req.params.id, req.user.id, req.body.text);
      // Notify post owner (if not commenting on own post)
      try {
        const post = await postService.getById(req.params.id);
        if (post.user_id !== req.user.id) {
          const commenterName = req.user.display_name || req.user.username;
          await notificationService.create(post.user_id, {
            type: "comment",
            content: `${commenterName} commented on your post`,
            reference_id: req.params.id,
          });
          await userService.awardKarma(req.user.id, 1);
        }
      } catch (notifErr) { console.log("Comment notification error:", notifErr.message); }
      res.status(201).json(comment);
    } catch (e) { next(e); }
  }
  async delete(req, res, next) {
    try { res.json(await postService.delete(req.user.id, req.params.id)); } catch (e) { next(e); }
  }
}

module.exports = new PostController();
