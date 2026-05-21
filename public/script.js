/* ===== Sociogram frontend (Vanilla JS SPA) ===== */
const API = '/api';
const app = document.getElementById('app');
const navbar = document.getElementById('navbar');

const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  viewingUserId: null,
};

// ---------- Helpers ----------
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function setAuth(token, user) {
  state.token = token; state.user = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  state.token = null; state.user = null;
  localStorage.clear();
  navigate('login');
}

function tpl(id) {
  return document.getElementById(id).content.cloneNode(true);
}

function fmtDate(d) {
  return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

// ---------- Router ----------
function navigate(page, params = {}) {
  if (!state.token && !['login', 'register'].includes(page)) page = 'login';
  navbar.classList.toggle('hidden', !state.token);
  app.innerHTML = '';
  switch (page) {
    case 'login': return renderLogin();
    case 'register': return renderRegister();
    case 'feed': return renderFeed();
    case 'explore': return renderExplore();
    case 'create': return renderCreate();
    case 'profile': return renderProfile(params.id || state.user.id);
    default: return renderFeed();
  }
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-page]');
  if (t) { e.preventDefault(); navigate(t.dataset.page); }
});
document.getElementById('logoutBtn').addEventListener('click', logout);

// ---------- Auth pages ----------
function renderLogin() {
  app.appendChild(tpl('tpl-login'));
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      setAuth(data.token, data.user);
      navigate('feed');
    } catch (err) {
      document.getElementById('loginErr').textContent = err.message;
    }
  });
}

function renderRegister() {
  app.appendChild(tpl('tpl-register'));
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      setAuth(data.token, data.user);
      navigate('feed');
    } catch (err) {
      document.getElementById('regErr').textContent = err.message;
    }
  });
}

// ---------- Feed ----------
async function renderFeed() {
  app.appendChild(tpl('tpl-feed'));
  const list = document.getElementById('feedList');
  list.innerHTML = '<p class="muted">Loading...</p>';
  try {
    const posts = await api('/posts');
    if (!posts.length) {
      list.innerHTML = '<p class="muted">No posts yet. Follow people on Explore or create one!</p>';
      return;
    }
    list.innerHTML = '';
    posts.forEach((p) => list.appendChild(renderPost(p)));
  } catch (err) {
    list.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

// ---------- Explore ----------
async function renderExplore() {
  app.appendChild(tpl('tpl-explore'));
  const usersList = document.getElementById('usersList');
  const exploreList = document.getElementById('exploreList');

  try {
    const users = await api('/users');
    usersList.innerHTML = '';
    users.filter((u) => u._id !== state.user.id).forEach((u) => {
      const isFollowing = u.followers.some((f) => f === state.user.id);
      const card = document.createElement('div');
      card.className = 'user-card';
      card.innerHTML = `
        <h4 data-uid="${u._id}">@${u.username}</h4>
        <p>${u.followers.length} followers</p>
        <button data-follow="${u._id}">${isFollowing ? 'Unfollow' : 'Follow'}</button>
      `;
      card.querySelector('h4').addEventListener('click', () => navigate('profile', { id: u._id }));
      card.querySelector('button').addEventListener('click', async (e) => {
        const btn = e.currentTarget; btn.disabled = true;
        const r = await api(`/follow/${u._id}`, { method: 'POST' });
        btn.textContent = r.following ? 'Unfollow' : 'Follow';
        btn.disabled = false;
      });
      usersList.appendChild(card);
    });

    const posts = await api('/posts/explore');
    exploreList.innerHTML = '';
    posts.forEach((p) => exploreList.appendChild(renderPost(p)));
  } catch (err) {
    usersList.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

// ---------- Create ----------
function renderCreate() {
  app.appendChild(tpl('tpl-create'));
  document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api('/posts', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      navigate('feed');
    } catch (err) {
      alert(err.message);
    }
  });
}

// ---------- Profile ----------
async function renderProfile(userId) {
  app.appendChild(tpl('tpl-profile'));
  const header = document.getElementById('profileHeader');
  const postsEl = document.getElementById('profilePosts');
  try {
    const { user, posts } = await api(`/users/${userId}`);
    const isMe = user._id === state.user.id;
    const isFollowing = user.followers.some((f) => f === state.user.id);

    header.className = 'profile-header';
    header.innerHTML = `
      <h2>@${user.username}</h2>
      <p class="bio">${user.bio || 'No bio yet.'}</p>
      <div class="stats">
        <div class="stat"><strong>${posts.length}</strong><span>Posts</span></div>
        <div class="stat"><strong>${user.followers.length}</strong><span>Followers</span></div>
        <div class="stat"><strong>${user.following.length}</strong><span>Following</span></div>
      </div>
      ${
        isMe
          ? `<button id="editProfileBtn">Edit Bio</button>`
          : `<button id="followBtn">${isFollowing ? 'Unfollow' : 'Follow'}</button>`
      }
    `;

    if (isMe) {
      header.querySelector('#editProfileBtn').addEventListener('click', async () => {
        const bio = prompt('Update bio:', user.bio || '');
        if (bio === null) return;
        await api('/users/me/update', { method: 'PUT', body: JSON.stringify({ bio }) });
        renderProfile(userId);
      });
    } else {
      header.querySelector('#followBtn').addEventListener('click', async (e) => {
        e.currentTarget.disabled = true;
        await api(`/follow/${user._id}`, { method: 'POST' });
        renderProfile(userId);
      });
    }

    postsEl.innerHTML = '';
    if (!posts.length) postsEl.innerHTML = '<p class="muted">No posts yet.</p>';
    posts.forEach((p) => postsEl.appendChild(renderPost(p)));
  } catch (err) {
    header.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

// ---------- Post component ----------
function renderPost(post) {
  const el = document.createElement('div');
  el.className = 'post';
  const isMine = post.author._id === state.user.id;
  const liked = post.likes?.some((l) => l === state.user.id || l?._id === state.user.id);

  el.innerHTML = `
    <div class="post-header">
      <span class="author" data-uid="${post.author._id}">@${post.author.username}</span>
      <span class="timestamp">${fmtDate(post.createdAt)}</span>
    </div>
    <div class="post-content">${escapeHtml(post.content)}</div>
    ${post.image ? `<img src="${post.image}" alt="post image" onerror="this.remove()" />` : ''}
    <div class="post-actions">
      <button class="like-btn ${liked ? 'liked' : ''}">❤ ${post.likes?.length || 0}</button>
      <button class="comment-toggle">💬 ${post.comments?.length || 0}</button>
      ${isMine ? '<button class="edit-btn">Edit</button><button class="delete-btn danger">Delete</button>' : ''}
    </div>
    <div class="comments hidden"></div>
  `;

  el.querySelector('.author').addEventListener('click', () =>
    navigate('profile', { id: post.author._id })
  );

  // Like
  el.querySelector('.like-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget; btn.disabled = true;
    const r = await api(`/posts/${post._id}/like`, { method: 'POST' });
    btn.textContent = `❤ ${r.likes}`;
    btn.classList.toggle('liked', r.liked);
    btn.disabled = false;
  });

  // Comments
  const commentsEl = el.querySelector('.comments');
  el.querySelector('.comment-toggle').addEventListener('click', () => {
    commentsEl.classList.toggle('hidden');
    if (!commentsEl.dataset.loaded) renderComments(post, commentsEl);
  });

  if (isMine) {
    el.querySelector('.edit-btn').addEventListener('click', async () => {
      const content = prompt('Edit post:', post.content);
      if (content === null) return;
      await api(`/posts/${post._id}`, { method: 'PUT', body: JSON.stringify({ content }) });
      navigate('feed');
    });
    el.querySelector('.delete-btn').addEventListener('click', async () => {
      if (!confirm('Delete this post?')) return;
      await api(`/posts/${post._id}`, { method: 'DELETE' });
      el.remove();
    });
  }
  return el;
}

function renderComments(post, container) {
  container.dataset.loaded = '1';
  container.innerHTML = '';
  (post.comments || []).forEach((c) => container.appendChild(commentEl(c)));
  const form = document.createElement('form');
  form.className = 'comment-form';
  form.innerHTML = `<input name="text" placeholder="Write a comment..." required maxlength="500" /><button>Send</button>`;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text) return;
    const c = await api(`/comments/${post._id}`, { method: 'POST', body: JSON.stringify({ text }) });
    container.insertBefore(commentEl(c), form);
    e.target.reset();
  });
  container.appendChild(form);
}

function commentEl(c) {
  const div = document.createElement('div');
  div.className = 'comment';
  const authorName = c.author?.username || 'user';
  div.innerHTML = `<span class="author">@${authorName}</span>${escapeHtml(c.text)}`;
  return div;
}

function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// ---------- Bootstrap ----------
navigate(state.token ? 'feed' : 'login');
