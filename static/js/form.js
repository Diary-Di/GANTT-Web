let tasksList = [];
let nextId = 1;

function parsePredecessors(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map(s => s.trim()).filter(Boolean);
    }
    return value
        .toString()
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
}

function normalizeTask(task) {
    const predecessors = parsePredecessors(task.predecessor || task.predecessors || []);
    return {
        ...task,
        predecessors,
        predecessor: predecessors.length ? predecessors.join(', ') : null
    };
}

function loadTasks() {
    const savedTasksJSON = document.getElementById('saved-tasks-data')?.textContent.trim();
    let loaded = [];

    if (savedTasksJSON) {
        try {
            loaded = JSON.parse(savedTasksJSON);
        } catch (e) {
            loaded = [];
        }
    }

    if (!Array.isArray(loaded) || loaded.length === 0) {
        const saved = localStorage.getItem('ganttTasks');
        loaded = saved ? JSON.parse(saved) : [];
    }

    tasksList = (loaded || []).map(normalizeTask);
    nextId = tasksList.length ? Math.max(...tasksList.map(t => parseInt(t.id) || 0)) + 1 : 1;
    renderTaskList();
    updateActionBar();
}

function saveTasks() {
    localStorage.setItem('ganttTasks', JSON.stringify(tasksList));
}

function submitTask() {
    const name = document.getElementById('taskName').value.trim();
    const duration = document.getElementById('taskDuration').value.trim();
    const predecessors = parsePredecessors(document.getElementById('predecessors').value);

    if (!name || !duration) {
        alert('Veuillez remplir au moins le nom et la durée');
        return;
    }

    const task = {
        id: nextId++,
        name,
        duration,
        predecessors,
        predecessor: predecessors.length ? predecessors.join(', ') : null
    };

    tasksList.push(task);
    saveTasks();
    renderTaskList();
    updateActionBar();
    clearForm();
}

function removeTask(id) {
    tasksList = tasksList.filter(t => t.id !== id);
    saveTasks();
    renderTaskList();
    updateActionBar();
}

function deleteTask(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        removeTask(id);
    }
}

function editTask(id) {
    const task = tasksList.find(t => t.id === id);
    if (!task) return;

    document.getElementById('taskName').value = task.name;
    document.getElementById('taskDuration').value = task.duration;
    document.getElementById('predecessors').value = task.predecessor || '';
    removeTask(id);
    document.getElementById('taskName').focus();
}

function renderTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (tasksList.length === 0) {
        document.getElementById('gridDivider').classList.add('hidden');
        return;
    }

    document.getElementById('gridDivider').classList.remove('hidden');

    tasksList.forEach(task => {
        const taskRow = document.createElement('div');
        taskRow.className = 'task-row';

        taskRow.innerHTML = `
            <div class="task-cell"><strong>${task.name}</strong></div>
            <div class="task-cell">${task.duration}</div>
            <div class="task-cell">${task.predecessor || '—'}</div>
            <div class="task-cell task-cell--actions">
                <button class="btn-small btn-edit" type="button" onclick="editTask(${task.id})">✎ Modifier</button>
                <button class="btn-small btn-delete" type="button" onclick="deleteTask(${task.id})">✕ Supprimer</button>
            </div>
        `;

        taskList.appendChild(taskRow);
    });
}

function updateActionBar() {
    const actionBar = document.getElementById('actionBar');
    if (tasksList.length > 0) {
        actionBar.classList.remove('hidden');
    } else {
        actionBar.classList.add('hidden');
    }
}

function clearForm() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskDuration').value = '';
    document.getElementById('predecessors').value = '';
    document.getElementById('taskName').focus();
}

function askClearConfirm() {
    if (confirm('Êtes-vous sûr de vouloir vider toute la liste ?')) {
        tasksList = [];
        localStorage.removeItem('ganttTasks');
        renderTaskList();
        updateActionBar();
    }
}

function validateTasks() {
    if (tasksList.length === 0) {
        alert('Veuillez ajouter au moins une tâche');
        return;
    }

    const payload = tasksList.map(task => ({
        id: task.id,
        name: task.name,
        duration: task.duration,
        predecessor: task.predecessor
    }));

    document.getElementById('tasksInput').value = JSON.stringify(payload);
    document.getElementById('ganttForm').submit();
}

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    clearForm();
});