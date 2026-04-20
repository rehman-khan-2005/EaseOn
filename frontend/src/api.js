import { auth } from "./firebase";

const BASE = "https://easeon-380.web.app/api";

async function getToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

async function request(path, options = {}) {
  const token = await getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || data.message || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}

async function checkConnection() {
  try {
    await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(10000) });
    return true;
  } catch { return false; }
}

const api = {
  checkConnection,

  // Users
  registerProfile: (body) => request("/users/register", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request("/users/me"),
  updateMe: (body) => request("/users/me", { method: "PUT", body: JSON.stringify(body) }),
  getUser: (id) => request(`/users/${id}`),
  getTopContributors: (limit = 50) => request(`/users/top-contributors?limit=${limit}`),
  searchUsers: (q) => request(`/users/search?q=${q}`),

  // Moods
  logMood: (body) => request("/moods", { method: "POST", body: JSON.stringify(body) }),
  getMoods: (days = 60) => request(`/moods?days=${days}`),

  // Journals
  createJournal: (body) => request("/journals", { method: "POST", body: JSON.stringify(body) }),
  getJournals: () => request("/journals"),
  getPublicJournals: (userId) => request(`/journals/user/${userId}`),
  updateJournal: (id, body) => request(`/journals/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteJournal: (id) => request(`/journals/${id}`, { method: "DELETE" }),

  // Circles
  getCircles: () => request("/circles"),
  getJoinedCircles: () => request("/circles/joined"),
  joinCircle: (id) => request(`/circles/${id}/join`, { method: "POST" }),
  leaveCircle: (id) => request(`/circles/${id}/leave`, { method: "POST" }),
  createCircle: (body) => request("/circles", { method: "POST", body: JSON.stringify(body) }),

  // Posts
  getPosts: (circleTag) => request(`/posts${circleTag ? `?circle_tag=${circleTag}` : ""}`),
  getMyPosts: () => request("/posts/mine"),
  createPost: (body) => request("/posts", { method: "POST", body: JSON.stringify(body) }),
  likePost: (id) => request(`/posts/${id}/like`, { method: "POST" }),
  unlikePost: (id) => request(`/posts/${id}/unlike`, { method: "POST" }),
  addComment: (postId, text) => request(`/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ text }) }),
  deletePost: (id) => request(`/posts/${id}`, { method: "DELETE" }),
  updatePost: (id, body) => request(`/posts/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  // Messages
  getInbox: () => request("/messages/inbox"),
  getConversation: (userId) => request(`/messages/direct/${userId}`),
  sendDM: (recipientId, content) => request("/messages/direct", { method: "POST", body: JSON.stringify({ recipient_id: recipientId, content }) }),
  markRead: (senderId) => request(`/messages/read/${senderId}`, { method: "PUT" }),
  sendCircleMessage: (circleId, content) => request(`/messages/circle/${circleId}`, { method: "POST", body: JSON.stringify({ content }) }),

  // Notifications
  getNotifications: () => request("/notifications"),
  markNotifRead: (id) => request(`/notifications/${id}/read`, { method: "PUT" }),

  // Push notifications
  saveFcmToken: (token) => request("/users/fcm-token", { method: "POST", body: JSON.stringify({ fcm_token: token }) }),
};

export default api;
