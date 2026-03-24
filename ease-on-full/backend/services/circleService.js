const { SupportCircle, CircleMembership, User } = require("../models");
const { Op } = require("sequelize");

class CircleService {
  /**
   * Create a new support circle
   */
  async create(userId, { name, description, visibility }) {
    const circle = await SupportCircle.create({
      creator_id: userId,
      name,
      description,
      visibility: visibility || "public",
      member_count: 1,
    });

    // Auto-join creator as admin
    await CircleMembership.create({
      circle_id: circle.id,
      user_id: userId,
      role: "admin",
    });

    return circle;
  }

  /**
   * Join a circle
   */
  async join(userId, circleId) {
    const circle = await SupportCircle.findByPk(circleId);
    if (!circle) {
      const err = new Error("Circle not found");
      err.statusCode = 404;
      throw err;
    }

    const existing = await CircleMembership.findOne({
      where: { circle_id: circleId, user_id: userId },
    });
    if (existing) {
      const err = new Error("Already a member of this circle");
      err.statusCode = 409;
      throw err;
    }

    await CircleMembership.create({
      circle_id: circleId,
      user_id: userId,
      role: "member",
    });

    circle.member_count += 1;
    await circle.save();

    return { joined: true, circle };
  }

  /**
   * Leave a circle
   */
  async leave(userId, circleId) {
    const membership = await CircleMembership.findOne({
      where: { circle_id: circleId, user_id: userId },
    });
    if (!membership) {
      const err = new Error("Not a member of this circle");
      err.statusCode = 404;
      throw err;
    }

    await membership.destroy();

    const circle = await SupportCircle.findByPk(circleId);
    if (circle) {
      circle.member_count = Math.max(0, circle.member_count - 1);
      await circle.save();
    }

    return { left: true };
  }

  /**
   * Get all circles (for Explore screen)
   */
  async getAll({ page = 1, limit = 20, search } = {}) {
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await SupportCircle.findAndCountAll({
      where,
      order: [["member_count", "DESC"]],
      limit,
      offset: (page - 1) * limit,
      include: [{ model: User, as: "creator", attributes: ["id", "username", "display_name"] }],
    });

    return { circles: rows, total: count, page, pages: Math.ceil(count / limit) };
  }

  /**
   * Get circles user has joined
   */
  async getJoined(userId) {
    const memberships = await CircleMembership.findAll({
      where: { user_id: userId },
      include: [{ model: SupportCircle, as: "circle" }],
    });
    return memberships.map((m) => ({ ...m.circle.toJSON(), role: m.role }));
  }

  /**
   * Get single circle with members
   */
  async getById(circleId) {
    const circle = await SupportCircle.findByPk(circleId, {
      include: [
        { model: User, as: "creator", attributes: ["id", "username", "display_name"] },
        {
          model: CircleMembership,
          as: "memberships",
          include: [{ model: User, as: "user", attributes: ["id", "username", "display_name", "avatar_url", "karma_score"] }],
        },
      ],
    });
    if (!circle) {
      const err = new Error("Circle not found");
      err.statusCode = 404;
      throw err;
    }
    return circle;
  }

  /**
   * Update member role (admin only)
   */
  async updateMemberRole(adminUserId, circleId, targetUserId, newRole) {
    const adminMembership = await CircleMembership.findOne({
      where: { circle_id: circleId, user_id: adminUserId, role: "admin" },
    });
    if (!adminMembership) {
      const err = new Error("Only admins can change member roles");
      err.statusCode = 403;
      throw err;
    }

    const membership = await CircleMembership.findOne({
      where: { circle_id: circleId, user_id: targetUserId },
    });
    if (!membership) {
      const err = new Error("Target user is not a member");
      err.statusCode = 404;
      throw err;
    }

    membership.role = newRole;
    await membership.save();
    return membership;
  }
}

module.exports = new CircleService();
