const columns = [
  { id: "todo", label: "To do" },
  { id: "progress", label: "In progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" }
];

const state = {
  token: localStorage.getItem("taskflow_token"),
  currentUser: null,
  projects: [],
  activeProject: null,
  tasks: [],
  activeTask: null,
  comments: []
};

const elements = {
  appNav: document.getElementById("appNav"),
  authShell: document.getElementById("authShell"),
  workspace: document.getElementById("workspace"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  showLogin: document.getElementById("showLogin"),
  showRegister: document.getElementById("showRegister"),
  logoutButton: document.getElementById("logoutButton"),
  refreshBoard: document.getElementById("refreshBoard"),
  profileCard: document.getElementById("profileCard"),
  projectForm: document.getElementById("projectForm"),
  projectList: document.getElementById("projectList"),
  projectCount: document.getElementById("projectCount"),
  boardHead: document.getElementById("boardHead"),
  projectTools: document.getElementById("projectTools"),
  memberForm: document.getElementById("memberForm"),
  taskForm: document.getElementById("taskForm"),
  assigneeSelect: document.getElementById("assigneeSelect"),
  board: document.getElementById("board"),
  taskDialog: document.getElementById("taskDialog"),
  taskDetail: document.getElementById("taskDetail"),
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

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(user) {
  return (user?.name || user?.username || "TF")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(date) {
  if (!date) {
    return "No due date";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

function showToast(message, type = "info") {
  elements.toast.textContent = message;
  elements.toast.className = `toast show ${type}`;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2800);
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
  elements.workspace.hidden = !isAuthenticated;
  elements.appNav.hidden = !isAuthenticated;
}

function renderProfile() {
  if (!state.currentUser) {
    elements.profileCard.innerHTML = "";
    return;
  }

  elements.profileCard.innerHTML = `
    <span class="avatar">${escapeHtml(initials(state.currentUser))}</span>
    <div>
      <strong>${escapeHtml(state.currentUser.name)}</strong>
      <span>@${escapeHtml(state.currentUser.username)}</span>
    </div>
  `;
}

function renderProjects() {
  elements.projectCount.textContent = state.projects.length;
  elements.projectList.innerHTML = state.projects.length
    ? state.projects
        .map(
          (project) => `
            <button class="project-item ${
              state.activeProject?.id === project.id ? "active" : ""
            }" type="button" data-project-id="${project.id}">
              <span>${escapeHtml(project.name)}</span>
              <small>${project.taskCount || 0} tasks</small>
            </button>
          `
        )
        .join("")
    : `<div class="empty-state">Create your first group project.</div>`;
}

function renderBoardHead() {
  if (!state.activeProject) {
    elements.projectTools.hidden = true;
    elements.boardHead.innerHTML = `
      <div>
        <p class="eyebrow">Project board</p>
        <h1>Select or create a project</h1>
        <p class="muted">Your projects and tasks will appear here.</p>
      </div>
    `;
    return;
  }

  elements.projectTools.hidden = false;
  const members = state.activeProject.members
    .map((member) => `<span class="member-pill">${escapeHtml(member.name)}</span>`)
    .join("");

  elements.boardHead.innerHTML = `
    <div>
      <p class="eyebrow">Project board</p>
      <h1>${escapeHtml(state.activeProject.name)}</h1>
      <p class="muted">${escapeHtml(
        state.activeProject.description || "No description yet."
      )}</p>
    </div>
    <div class="member-row">${members}</div>
  `;
}

function renderAssignees() {
  const members = state.activeProject?.members || [];
  elements.assigneeSelect.innerHTML = `
    <option value="">Unassigned</option>
    ${members
      .map((member) => `<option value="${member.id}">${escapeHtml(member.name)}</option>`)
      .join("")}
  `;
}

function renderTask(task) {
  return `
    <article class="task-card" data-task-id="${task.id}">
      <div class="task-top">
        <span class="priority ${task.priority}">${escapeHtml(task.priority)}</span>
        <button class="task-link" type="button" data-action="open-task" data-task-id="${task.id}">
          Details
        </button>
      </div>
      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.description || "No extra details.")}</p>
      <div class="task-meta">
        <span>${escapeHtml(task.assignee?.name || "Unassigned")}</span>
        <span>${formatDate(task.dueDate)}</span>
      </div>
      <div class="task-actions">
        <select data-action="status" data-task-id="${task.id}" aria-label="Task status">
          ${columns
            .map(
              (column) => `
                <option value="${column.id}" ${column.id === task.status ? "selected" : ""}>
                  ${column.label}
                </option>
              `
            )
            .join("")}
        </select>
        <span>${task.commentCount} comments</span>
      </div>
    </article>
  `;
}

function renderBoard() {
  if (!state.activeProject) {
    elements.board.innerHTML = `<div class="empty-state board-empty">Create or select a project to see the board.</div>`;
    return;
  }

  elements.board.innerHTML = columns
    .map((column) => {
      const tasks = state.tasks.filter((task) => task.status === column.id);
      return `
        <section class="column">
          <div class="column-head">
            <h2>${column.label}</h2>
            <span>${tasks.length}</span>
          </div>
          <div class="column-tasks">
            ${
              tasks.length
                ? tasks.map(renderTask).join("")
                : `<div class="empty-state">No tasks here.</div>`
            }
          </div>
        </section>
      `;
    })
    .join("");
}

function renderAll() {
  renderProfile();
  renderProjects();
  renderBoardHead();
  renderAssignees();
  renderBoard();
}

async function loadCurrentUser() {
  const { user } = await api("/api/auth/me");
  state.currentUser = user;
}

async function loadProjects() {
  const { projects } = await api("/api/projects");
  state.projects = projects;
  if (!state.activeProject && projects.length) {
    await loadProject(projects[0].id);
  }
}

async function loadProject(projectId) {
  const { project, tasks } = await api(`/api/projects/${projectId}`);
  state.activeProject = project;
  state.tasks = tasks;
  const index = state.projects.findIndex((item) => item.id === project.id);
  if (index >= 0) {
    state.projects[index] = { ...state.projects[index], ...project, taskCount: tasks.length };
  }
  renderAll();
}

async function bootstrap() {
  if (!state.token) {
    setAuthenticated(false);
    renderAll();
    return;
  }

  try {
    await loadCurrentUser();
    setAuthenticated(true);
    await loadProjects();
    renderAll();
  } catch (error) {
    localStorage.removeItem("taskflow_token");
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
    localStorage.setItem("taskflow_token", token);
    setAuthenticated(true);
    await loadProjects();
    renderAll();
    showToast("Workspace opened.");
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
    localStorage.setItem("taskflow_token", token);
    setAuthenticated(true);
    await loadProjects();
    renderAll();
    showToast("Account created.");
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.logoutButton.addEventListener("click", () => {
  localStorage.removeItem("taskflow_token");
  state.token = null;
  state.currentUser = null;
  state.projects = [];
  state.activeProject = null;
  state.tasks = [];
  setAuthenticated(false);
  renderAll();
  showToast("Signed out.");
});

elements.refreshBoard.addEventListener("click", async () => {
  if (state.activeProject) {
    await loadProject(state.activeProject.id);
  } else {
    await loadProjects();
  }
  showToast("Board refreshed.");
});

elements.projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(event.currentTarget));

  try {
    const { project } = await api("/api/projects", {
      method: "POST",
      body: JSON.stringify(formData)
    });
    state.projects = [project, ...state.projects];
    event.currentTarget.reset();
    await loadProject(project.id);
    showToast("Project created.");
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.projectList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-project-id]");
  if (!button) {
    return;
  }
  await loadProject(button.dataset.projectId);
});

elements.memberForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.activeProject) {
    return;
  }
  const formData = Object.fromEntries(new FormData(event.currentTarget));

  try {
    const { project } = await api(`/api/projects/${state.activeProject.id}/members`, {
      method: "POST",
      body: JSON.stringify(formData)
    });
    state.activeProject = { ...state.activeProject, ...project };
    event.currentTarget.reset();
    renderAll();
    showToast("Member added.");
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.activeProject) {
    return;
  }

  const formData = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const { task } = await api(`/api/projects/${state.activeProject.id}/tasks`, {
      method: "POST",
      body: JSON.stringify(formData)
    });
    state.tasks = [task, ...state.tasks];
    event.currentTarget.reset();
    renderAll();
    showToast("Task added.");
  } catch (error) {
    showToast(error.message, "error");
  }
});

elements.board.addEventListener("change", async (event) => {
  const select = event.target.closest('select[data-action="status"]');
  if (!select || !state.activeProject) {
    return;
  }

  const task = state.tasks.find((item) => item.id === select.dataset.taskId);
  if (!task) {
    return;
  }

  try {
    const { task: updatedTask } = await api(
      `/api/projects/${state.activeProject.id}/tasks/${task.id}`,
      {
        method: "PUT",
        body: JSON.stringify({ status: select.value })
      }
    );
    state.tasks = state.tasks.map((item) => (item.id === updatedTask.id ? updatedTask : item));
    renderBoard();
  } catch (error) {
    showToast(error.message, "error");
    renderBoard();
  }
});

elements.board.addEventListener("click", async (event) => {
  const button = event.target.closest('[data-action="open-task"]');
  if (!button || !state.activeProject) {
    return;
  }

  state.activeTask = state.tasks.find((task) => task.id === button.dataset.taskId);
  if (!state.activeTask) {
    return;
  }

  const { comments } = await api(
    `/api/projects/${state.activeProject.id}/tasks/${state.activeTask.id}/comments`
  );
  state.comments = comments;
  renderTaskDetail();
  elements.taskDialog.showModal();
});

function renderTaskDetail() {
  const task = state.activeTask;
  if (!task) {
    elements.taskDetail.innerHTML = "";
    return;
  }

  elements.taskDetail.innerHTML = `
    <div class="detail-head">
      <span class="priority ${task.priority}">${escapeHtml(task.priority)}</span>
      <h2>${escapeHtml(task.title)}</h2>
      <p>${escapeHtml(task.description || "No task description.")}</p>
      <div class="task-meta">
        <span>Assigned to ${escapeHtml(task.assignee?.name || "nobody yet")}</span>
        <span>Due ${formatDate(task.dueDate)}</span>
      </div>
    </div>

    <form class="comment-form" id="commentForm">
      <input type="text" name="content" maxlength="240" placeholder="Write a task comment" required />
      <button class="button button-primary" type="submit">Comment</button>
    </form>

    <div class="comment-list">
      ${
        state.comments.length
          ? state.comments
              .map(
                (comment) => `
                  <div class="comment">
                    <strong>${escapeHtml(comment.author.name)}</strong>
                    <p>${escapeHtml(comment.content)}</p>
                    <small>${formatDate(comment.createdAt)}</small>
                  </div>
                `
              )
              .join("")
          : `<div class="empty-state">No comments yet.</div>`
      }
    </div>
  `;
}

elements.taskDetail.addEventListener("submit", async (event) => {
  const form = event.target.closest("#commentForm");
  if (!form || !state.activeProject || !state.activeTask) {
    return;
  }

  event.preventDefault();
  const formData = Object.fromEntries(new FormData(form));

  try {
    const { comment } = await api(
      `/api/projects/${state.activeProject.id}/tasks/${state.activeTask.id}/comments`,
      {
        method: "POST",
        body: JSON.stringify(formData)
      }
    );
    state.comments = [...state.comments, comment];
    state.tasks = state.tasks.map((task) =>
      task.id === state.activeTask.id
        ? { ...task, commentCount: task.commentCount + 1 }
        : task
    );
    state.activeTask = state.tasks.find((task) => task.id === state.activeTask.id);
    renderTaskDetail();
    renderBoard();
  } catch (error) {
    showToast(error.message, "error");
  }
});

document.querySelector(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  if (state.activeProject) {
    loadProject(state.activeProject.id);
  }
});

bootstrap();
