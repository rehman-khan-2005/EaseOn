const { Post, Comment, User } = require("../models");

class PostService {
  async create(userId, { text, circle_tag, mood_value, visibility }) {
    const post = await Post.create({ user_id: userId, text, circle_tag: circle_tag || "#General", mood_value, visibility: visibility || "public" });
    return this.getById(post.id);
  }

  async getAll({ page = 1, limit = 20, circle_tag } = {}) {
    const where = {};
    if (circle_tag) where.circle_tag = circle_tag;
    const { rows, count } = await Post.findAndCountAll({
      where, order: [["created_at", "DESC"]], limit, offset: (page - 1) * limit,
      include: [
        { model: User, as: "user", attributes: ["id", "username", "display_name", "avatar_url", "is_anonymous"] },
        { model: Comment, as: "comments", include: [{ model: User, as: "user", attributes: ["id", "username", "display_name", "avatar_url"] }] },
      ],
    });
    return { posts: rows, total: count, page, pages: Math.ceil(count / limit) };
  }

  async getById(id) {
    const post = await Post.findByPk(id, {
      include: [
        { model: User, as: "user", attributes: ["id", "username", "display_name", "avatar_url", "is_anonymous"] },
        { model: Comment, as: "comments", order: [["created_at", "ASC"]], include: [{ model: User, as: "user", attributes: ["id", "username", "display_name", "avatar_url"] }] },
      ],
    });
    if (!post) { const e = new Error("Post not found"); e.statusCode = 404; throw e; }
    return post;
  }

  async getByUser(userId) {
    return Post.findAll({
      where: { user_id: userId }, order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["id", "username", "display_name", "avatar_url"] },
        { model: Comment, as: "comments", include: [{ model: User, as: "user", attributes: ["id", "username", "display_name", "avatar_url"] }] },
      ],
    });
  }

  async like(postId) {
    const post = await Post.findByPk(postId);
    if (!post) { const e = new Error("Post not found"); e.statusCode = 404; throw e; }
    post.likes += 1;
    await post.save();
    return post;
  }

  async unlike(postId) {
    const post = await Post.findByPk(postId);
    if (!post) return;
    post.likes = Math.max(0, post.likes - 1);
    await post.save();
    return post;
  }

  async addComment(postId, userId, text) {
    const post = await Post.findByPk(postId);
    if (!post) { const e = new Error("Post not found"); e.statusCode = 404; throw e; }
    const comment = await Comment.create({ post_id: postId, user_id: userId, text });
    return Comment.findByPk(comment.id, {
      include: [{ model: User, as: "user", attributes: ["id", "username", "display_name", "avatar_url"] }],
    });
  }

  async delete(userId, postId) {
    const post = await Post.findOne({ where: { id: postId, user_id: userId } });
    if (!post) { const e = new Error("Post not found"); e.statusCode = 404; throw e; }
    await Comment.destroy({ where: { post_id: postId } });
    await post.destroy();
    return { deleted: true };
  }
}

module.exports = new PostService();
