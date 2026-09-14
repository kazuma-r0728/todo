const STORAGE_KEY = "todo-app.tasks";

const state = {
  tasks: loadTasks(),
  filter: "all",
};

const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const addForm = document.getElementById("addForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const itemsLeft = document.getElementById("itemsLeft");
const filtersEl = document.getElementById("filters");
const clearCompletedBtn = document.getElementById("clearCompleted");
const todayEl = document.getElementById("today");

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function addTask(text, priority) {
  state.tasks.unshift({
    id: crypto.randomUUID(),
    text,
    priority,
    completed: false,
    createdAt: Date.now(),
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function editTask(id, newText) {
  const task = state.tasks.find((t) => t.id === id);
  if (task && newText.trim()) {
    task.text = newText.trim();
    saveTasks();
  }
  render();
}

function clearCompleted() {
  state.tasks = state.tasks.filter((t) => !t.completed);
  saveTasks();
  render();
}

function getFilteredTasks() {
  if (state.filter === "active") return state.tasks.filter((t) => !t.completed);
  if (state.filter === "completed") return state.tasks.filter((t) => t.completed);
  return state.tasks;
}

function render() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = "";

  for (const task of filtered) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " is-completed" : "");
    li.dataset.id = task.id;

    const priorityDot = document.createElement("span");
    priorityDot.className = "task-item__priority";
    priorityDot.dataset.priority = task.priority;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-item__checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-item__text";
    text.textContent = task.text;
    text.title = "クリックして編集";
    text.addEventListener("click", () => startEdit(text, task));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task-item__delete";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", "削除");
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    li.append(priorityDot, checkbox, text, deleteBtn);
    taskList.appendChild(li);
  }

  emptyState.classList.toggle("is-visible", filtered.length === 0);

  const remaining = state.tasks.filter((t) => !t.completed).length;
  itemsLeft.textContent = `${remaining} 件の未完了タスク`;
}

function startEdit(span, task) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "add-form__input";
  input.value = task.text;
  input.maxLength = 200;
  span.replaceWith(input);
  input.focus();
  input.select();

  const commit = () => editTask(task.id, input.value);
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") {
      input.removeEventListener("blur", commit);
      render();
    }
  });
}

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text, prioritySelect.value);
  taskInput.value = "";
  taskInput.focus();
});

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  state.filter = btn.dataset.filter;
  for (const b of filtersEl.querySelectorAll(".filter-btn")) {
    b.classList.toggle("is-active", b === btn);
  }
  render();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

todayEl.textContent = new Date().toLocaleDateString("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

render();
