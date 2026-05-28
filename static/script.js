let tasks = [];
let editingId = null;

function submitTask() {
  const name        = document.getElementById("taskName").value.trim();
  const duration    = document.getElementById("taskDuration").value.trim();
  const predecessor = document.getElementById("predecessors").value.trim();
  const successor   = document.getElementById("successors").value.trim();

  if (!name || !duration) return;

  if (editingId !== null) {
    // Mode modification
    const task = tasks.find(t => t.id === editingId);
    if (task) {
      task.name        = name;
      task.duration    = duration;
      task.predecessor = predecessor;
      task.successor   = successor;
    }
    editingId = null;
    document.getElementById("submitBtn").textContent = "+ Ajouter";
  } else {
    // Nouvelle tâche
    const id = Date.now();
    tasks.push({ id, name, duration, predecessor, successor });
  }

  resetForm();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById("taskName").value     = task.name;
  document.getElementById("taskDuration").value = task.duration;
  document.getElementById("predecessors").value = task.predecessor;
  document.getElementById("successors").value   = task.successor;

  editingId = id;
  document.getElementById("submitBtn").textContent = "✓ Enregistrer";
  document.getElementById("taskName").focus();
}

function renderTasks() {
  const taskList   = document.getElementById("taskList");
  const divider    = document.getElementById("gridDivider");

  taskList.innerHTML = "";

  if (tasks.length === 0) {
    divider.classList.add("hidden");
    return;
  }

  divider.classList.remove("hidden");

  tasks.forEach(task => {
    const row = document.createElement("div");
    row.className = "task-row task-row--data";
    row.setAttribute("data-id", task.id);

    row.innerHTML = `
      <div class="task-cell">
        <span>${task.name}</span>
      </div>
      <div class="task-cell">
        <span>${task.duration}</span>
      </div>
      <div class="task-cell">
        <span class="${task.predecessor ? '' : 'empty'}">${task.predecessor || '—'}</span>
      </div>
      <div class="task-cell">
        <span class="${task.successor ? '' : 'empty'}">${task.successor || '—'}</span>
      </div>
      <div class="task-cell task-cell--actions">
        <button class="btn-edit"   onclick="editTask(${task.id})">Modifier</button>
        <button class="btn-delete" onclick="deleteTask(${task.id})">Supprimer</button>
      </div>
    `;

    taskList.appendChild(row);
  });
}

function resetForm() {
  document.getElementById("taskName").value     = "";
  document.getElementById("taskDuration").value = "";
  document.getElementById("predecessors").value = "";
  document.getElementById("successors").value   = "";
  document.getElementById("taskName").focus();
}