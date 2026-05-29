const state = {
  token: localStorage.getItem("socialsphere_token"),
  currentUser: null,
  feed: [],
  profile: null,
  profilePosts: [],
  comments: {},
  openComments: new Set(),
  editingPostId: null,
  activeView: "feed"
};

const elements = {
  appNav: document.getElementById("appNav"),
  authShell: document.getElementById("authShell"),
  appShell: document.getElementById("appShell"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  showLogin: document.getElementById("showLogin"),
  showRegister: document.getElementById("showRegister"),
  logoutButton: document.getElementById("logoutButton"),
  miniProfile: document.getElementById("miniProfile"),
  feedView: document.getElementById("feedView"),
  profileView: document.getElementById("profileView"),
  feedList: document.getElementById("feedList"),
  profilePosts: document.getElementById("profilePosts"),
  profileCard: document.getElementById("profileCard"),
  postForm: document.getElementById("postForm"),
  postContent: document.getElementById("postContent"),
  postCount: document.getElementById("postCount"),
  refreshFeed: document.getElementById("refreshFeed"),
  searchUsers: document.getElementById("searchUsers"),
  searchResults: document.getElementById("searchResults"),
  toast: document.getElementById("toast")
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function showToast(message, type = "info") {
  elements.toast.textContent = message;
  elements.toast.style.background =
    type === "error" ? "var(--danger)" : "var(--ink)";
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 3000);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(user) {
  return (user?.name || user?.username || "S")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(date));
}

function setAuthMode(mode) {
  const isLogin = mode === "login";
  elements.loginForm.hidden = !isLogin;
  elements.registerForm.hidden = isLogin;
  elements.showLogin.classList.toggle("active", isLogin);
  elements.showRegister.classList.toggle("active", !isLogin);
}

function setAuthenticated(isAuthenticated) {
  elements.authShell.hidden = isAuthenticated;
  elements.appShell.hidden = !isAuthenticated;
  elements.appNav.hidden = !isAuthenticated;
}

function renderMiniProfile() {
  if (!state.currentUser) {
    elements.miniProfile.innerHTML = "";
    return;
  }

  elements.miniProfile.innerHTML = `
    <div class="identity">
      <span class="avatar">${escapeHtml(initials(state.currentUser))}</span>
      <div>
        <strong>${escapeHtml(state.currentUser.name)}</strong>
        <span>@${escapeHtml(state.currentUser.username)}</span>
      </div>
    </div>
    <p class="muted">${escapeHtml(
      state.currentUser.bio || "Welcome back to your sphere."
    )}</p>
  `;
}

function setActiveView(view) {
  state.activeView = view;
  elements.feedView.hidden = view !== "feed";
  elements.profileView.hidden = view !== "profile";

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
}

function renderPost(post, scope) {
  const comments = state.comments[post.id] || [];
  const commentsOpen = state.openComments.has(post.id);
  const isEditing = state.editingPostId === post.id;
  const ownerActions = post.canEdit
    ? `
      <button class="action-button" type="button" data-action="edit" data-id="${post.id}">Edit</button>
      <button class="action-button" type="button" data-action="delete" data-id="${post.id}">Delete</button>
    `
    : "";

  return `
    <article class="post-card" data-post-id="${post.id}" data-scope="${scope}">
      <div class="identity">
        <button class="avatar" type="button" data-action="open-profile" data-username="${escapeHtml(
          post.author.username
        )}" aria-label="Open ${escapeHtml(post.author.username)} profile">
          ${escapeHtml(initials(post.author))}
        </button>
        <div>
          <strong>${escapeHtml(post.author.name)}</strong>
          <span>@${escapeHtml(post.author.username)} · ${formatDate(
            post.createdAt
          )}</span>
        </div>
      </div>

      ${
        isEditing
          ? `
            <textarea class="edit-input" maxlength="500">${escapeHtml(
              post.content
            )}</textarea>
            <div class="post-actions">
              <button class="action-button active" type="button" data-action="save-edit" data-id="${post.id}">Save</button>
              <button class="action-button" type="button" data-action="cancel-edit" data-id="${post.id}">Cancel</button>
            </div>
          `
          : `<p class="post-content">${escapeHtml(post.content)}</p>`
      }

      <div class="post-actions">
        <button
          class="action-button ${post.likedByMe ? "active" : ""}"
          type="button"
          data-action="${post.likedByMe ? "unlike" : "like"}"
          data-id="${post.id}"
        >
          ${post.likedByMe ? "Unlike" : "Like"} · ${post.likeCount}
        </button>
        <button class="action-button" type="button" data-action="toggle-comments" data-id="${post.id}">
          Comments · ${post.commentCount}
        </button>
        ${ownerActions}
      </div>

      ${
        commentsOpen
          ? `
            <div class="comments">
              <form class="comment-form" data-post-id="${post.id}">
                <input type="text" name="content" maxlength="240" placeholder="Add a comment" required />
                <button class="button button-primary" type="submit">Reply</button>
              </form>
              <div class="comment-list">
                ${
                  comments.length
                    ? comments.map(renderComment).join("")
                    : `<div class="empty-state">No comments yet.</div>`
                }
              </div>
            </div>
          `
          : ""
      }
    </article>
  `;
}

function renderComment(comment) {
  return `
    <div class="comment-row">
      <div>
        <strong>${escapeHtml(comment.author.name)}</strong>
        <span class="meta">@${escapeHtml(comment.author.username)} · ${formatDate(
          comment.createdAt
        )}</span>
        <p>${escapeHtml(comment.content)}</p>
      </div>
      ${
        comment.canDelete
          ? `<button class="action-button" type="button" data-action="delete-comment" data-id="${comment.id}" data-post-id="${comment.post}">Delete</button>`
          : ""
      }
    </div>
  `;
}

function renderFeed() {
  elements.feedList.innerHTML = state.feed.length
    ? state.feed.map((post) => renderPost(post, "feed")).join("")
    : `<div class="empty-state">Follow people or create your first post to start the feed.</div>`;
}

function renderProfile() {
  if (!state.profile) {
    elements.profileCard.innerHTML = "";
    elements.profilePosts.innerHTML = "";
    return;
  }

  const user = state.profile;
  elements.profileCard.innerHTML = `
    <div class="profile-top">
      <div class="profile-main">
        <span class="avatar">${escapeHtml(initials(user))}</span>
        <div>
          <h2>${escapeHtml(user.name)}</h2>
          <p class="muted">@${escapeHtml(user.username)}</p>
        </div>
      </div>
      ${
        user.isMe
          ? ""
          : `<button class="button ${
              user.isFollowing ? "button-ghost" : "button-primary"
            }" type="button" data-action="${
              user.isFollowing ? "unfollow-user" : "follow-user"
            }" data-id="${user.id}">
              ${user.isFollowing ? "Unfollow" : "Follow"}
            </button>`
      }
    </div>
    <p>${escapeHtml(user.bio || "No bio added yet.")}</p>
    <div class="profile-stats">
      <div class="stat"><strong>${user.postsCount}</strong><span>Posts</span></div>
      <div class="stat"><strong>${user.followersCount}</strong><span>Followers</span></div>
      <div class="stat"><strong>${user.followingCount}</strong><span>Following</span></div>
    </div>
  `;

  elements.profilePosts.innerHTML = state.profilePosts.length
    ? state.profilePosts.map((post) => renderPost(post, "profile")).join("")
    : `<div class="empty-state">This profile has no posts yet.</div>`;
}

function upsertPost(updatedPost) {
  state.feed = state.feed.map((post) =>
    post.id === updatedPost.id ? updatedPost : post
  );
  state.profilePosts = state.profilePosts.map((post) =>
    post.id === updatedPost.id ? updatedPost : post
  );
}

async function loadCurrentUser() {
  const { user } = await api("/api/auth/me");
  state.currentUser = user;
  renderMiniProfile();
}

async function loadFeed() {
  const { posts } = await api("/api/posts");
  state.feed = posts;
  renderFeed();
}

async function loadProfile(username = state.currentUser.username) {
  const [{ user }, { posts }] = await Promise.all([
    api(`/api/users/${encodeURIComponent(username)}`),
    api(`/api/users/${encodeURIComponent(username)}/posts`)
  ]);
  state.profile = user;
  state.profilePosts = posts;
  renderProfile();
  setActiveView("profile");
}

async function loadComments(postId) {
  const { comments } = await api(`/api/posts/${postId}/comments`);
  state.comments[postId] = comments;
}

async function bootstrap() {
  if (!state.token) {
    setAuthenticated(false);
    return;
  }

  try {
    await loadCurrentUser();
    setAuthenticated(true);
    await loadFeed();
    setActiveView("feed");
  } catch (error) {
    localStorage.removeItem("socialsphere_token");
    state.token = null;
    setAuthenticated(false);
    showToast(error.message, "error");
  }
}

elements.showLogin.addEventListener("click", () => setAuthMode("login"));
elements.showRegister.addEventListener("click", () => setAuthMode("register"));

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(event.currentTarget));

  try {
    const { token, user } = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(formData)
    });
    state.token = token;
    state.currentUser = user;
    localStorage.setItem("socialsphere_token", token);
    setAuthenticated(true);
    renderMiniProfile();
    await loadFeed();
    setActiveView("feed");
    showToast("Logged in successfully.");
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(event.currentTarget));
  formData.username = formData.username.toLowerCase();

  try {
    const { token, user } = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formData)
    });
    state.token = token;
    state.currentUser = user;
    localStorage.setItem("socialsphere_token", token);
    setAuthenticated(true);
    renderMiniProfile();
    await loadFeed();
    setActiveView("feed");
    showToast("Account created.");
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.logoutButton.addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch (error) {
    // JWT logout is stateless, so local cleanup is still valid.
  }

  state.token = null;
  state.currentUser = null;
  localStorage.removeItem("socialsphere_token");
  setAuthenticated(false);
  showToast("Logged out.");
});

document.querySelector(".brand").addEventListener("click", async (event) => {
  event.preventDefault();
  if (state.token) {
    setActiveView("feed");
    await loadFeed();
  }
});

elements.appNav.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) {
    return;
  }

  if (button.dataset.view === "feed") {
    setActiveView("feed");
    await loadFeed();
  }

  if (button.dataset.view === "profile") {
    await loadProfile();
  }
});

elements.postContent.addEventListener("input", () => {
  elements.postCount.textContent = `${elements.postContent.value.length}/500`;
});

elements.postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = elements.postContent.value.trim();

  if (!content) {
    return;
  }

  try {
    const { post } = await api("/api/posts", {
      method: "POST",
      body: JSON.stringify({ content })
    });
    state.feed = [post, ...state.feed];
    if (state.profile?.isMe) {
      state.profilePosts = [post, ...state.profilePosts];
      state.profile.postsCount += 1;
    }
    elements.postContent.value = "";
    elements.postCount.textContent = "0/500";
    renderFeed();
    renderProfile();
    showToast("Post published.");
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.refreshFeed.addEventListener("click", async () => {
  await loadFeed();
  showToast("Feed refreshed.");
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest(".comment-form");
  if (!form) {
    return;
  }

  event.preventDefault();
  const postId = form.dataset.postId;
  const input = form.elements.content;
  const content = input.value.trim();

  if (!content) {
    return;
  }

  try {
    await api(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content })
    });
    input.value = "";
    await loadComments(postId);
    await loadFeed();
    if (state.profile) {
      const username = state.profile.username;
      const { posts } = await api(`/api/users/${encodeURIComponent(username)}/posts`);
      state.profilePosts = posts;
    }
    renderFeed();
    renderProfile();
  } catch (error) {
    showToast(error.message, "error");
  }
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;

  try {
    if (action === "open-profile") {
      await loadProfile(button.dataset.username);
    }

    if (action === "like" || action === "unlike") {
      const { post } = await api(`/api/posts/${id}/like`, {
        method: action === "like" ? "POST" : "DELETE"
      });
      upsertPost(post);
      renderFeed();
      renderProfile();
    }

    if (action === "toggle-comments") {
      if (state.openComments.has(id)) {
        state.openComments.delete(id);
      } else {
        state.openComments.add(id);
        await loadComments(id);
      }
      renderFeed();
      renderProfile();
    }

    if (action === "edit") {
      state.editingPostId = id;
      renderFeed();
      renderProfile();
    }

    if (action === "cancel-edit") {
      state.editingPostId = null;
      renderFeed();
      renderProfile();
    }

    if (action === "save-edit") {
      const card = button.closest(".post-card");
      const content = card.querySelector(".edit-input").value.trim();
      const { post } = await api(`/api/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify({ content })
      });
      state.editingPostId = null;
      upsertPost(post);
      renderFeed();
      renderProfile();
      showToast("Post updated.");
    }

    if (action === "delete") {
      const confirmed = window.confirm("Delete this post?");
      if (!confirmed) {
        return;
      }

      await api(`/api/posts/${id}`, { method: "DELETE" });
      state.feed = state.feed.filter((post) => post.id !== id);
      state.profilePosts = state.profilePosts.filter((post) => post.id !== id);
      if (state.profile?.isMe) {
        state.profile.postsCount = Math.max(0, state.profile.postsCount - 1);
      }
      renderFeed();
      renderProfile();
      showToast("Post deleted.");
    }

    if (action === "delete-comment") {
      await api(`/api/comments/${id}`, { method: "DELETE" });
      await loadComments(button.dataset.postId);
      renderFeed();
      renderProfile();
    }

    if (action === "follow-user" || action === "unfollow-user") {
      await api(`/api/users/${id}/follow`, {
        method: action === "follow-user" ? "POST" : "DELETE"
      });
      await loadProfile(state.profile.username);
      await loadFeed();
      showToast(action === "follow-user" ? "User followed." : "User unfollowed.");
    }
  } catch (error) {
    showToast(error.message, "error");
  }
});

let searchTimeout;
elements.searchUsers.addEventListener("input", () => {
  window.clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(async () => {
    const query = elements.searchUsers.value.trim();
    if (!query) {
      elements.searchResults.innerHTML = "";
      return;
    }

    try {
      const { users } = await api(`/api/users/search?q=${encodeURIComponent(query)}`);
      elements.searchResults.innerHTML = users.length
        ? users
            .map(
              (user) => `
                <button class="search-result" type="button" data-action="open-profile" data-username="${escapeHtml(
                  user.username
                )}">
                  <span>${escapeHtml(user.name)}</span>
                  <span class="meta">@${escapeHtml(user.username)}</span>
                </button>
              `
            )
            .join("")
        : `<div class="empty-state">No people found.</div>`;
    } catch (error) {
      showToast(error.message, "error");
    }
  }, 250);
});

bootstrap();
