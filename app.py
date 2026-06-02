from flask import Flask, render_template, request
import json

app = Flask(__name__)

class Task:
    def __init__(self, id, name, duration, predecessor=None):
        self.id = id
        self.name = name
        self.duration = int(duration)
        if isinstance(predecessor, list):
            preds = predecessor
        elif isinstance(predecessor, str):
            preds = [p.strip() for p in predecessor.split(',') if p.strip() and p.strip() != '—']
        else:
            preds = []
        self.predecessors = preds
        self.predecessor = ', '.join(preds) if preds else None
        self.start = 0
        self.end = 0
        self.late_start = 0
        self.late_end = 0
        self.slack = 0          # Marge Totale
        self.free_slack = 0     # Marge Libre
        self.is_critical = False
        self.successors = []

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'duration': self.duration,
            'predecessor': self.predecessor,
            'start': self.start,
            'end': self.end,
            'late_start': self.late_start,
            'late_end': self.late_end,
            'slack': self.slack,
            'free_slack': self.free_slack,
            'is_critical': self.is_critical
        }

def compute_gantt_schedule(tasks_data):
    if not tasks_data:
        return []

    tasks = []
    task_dict = {}

    # Création des tâches
    for t in tasks_data:
        task = Task(
            id=t.get('id'),
            name=t.get('name'),
            duration=t.get('duration'),
            predecessor=t.get('predecessor') or t.get('predecessors')
        )
        tasks.append(task)
        task_dict[task.name] = task

    # Construction des successeurs
    for task in tasks:
        for pred_name in task.predecessors:
            pred = task_dict.get(pred_name)
            if pred:
                pred.successors.append(task)

    # Tri topologique pour calculs fiables même hors ordre initial
    indegree = {task.name: 0 for task in tasks}
    for task in tasks:
        for succ in task.successors:
            indegree[succ.name] += 1

    queue = [task for task in tasks if indegree[task.name] == 0]
    topo_order = []

    while queue:
        current = queue.pop(0)
        topo_order.append(current)
        for succ in current.successors:
            indegree[succ.name] -= 1
            if indegree[succ.name] == 0:
                queue.append(succ)

    if len(topo_order) != len(tasks):
        topo_order = tasks  # fallback en cas de cycle / dépendances manquantes

    # ==================== FORWARD PASS ====================
    for task in topo_order:
        if not task.predecessors:
            task.start = 0
        else:
            pred_ends = [task_dict[p].end for p in task.predecessors if p in task_dict]
            task.start = max(pred_ends) if pred_ends else 0
        task.end = task.start + task.duration

    # ==================== BACKWARD PASS ====================
    project_duration = max((task.end for task in tasks), default=0)

    for task in tasks:
        task.late_end = project_duration
        task.late_start = task.late_end - task.duration

    for task in reversed(topo_order):
        if task.successors:
            min_successor_start = min(s.late_start for s in task.successors)
            task.late_end = min_successor_start
            task.late_start = task.late_end - task.duration

    # Calcul Marge Totale
    for task in tasks:
        task.slack = task.late_start - task.start
        task.is_critical = task.slack == 0

    # ==================== MARGE LIBRE (Free Slack) ====================
    for task in tasks:
        if task.successors:
            min_es_successor = min(s.start for s in task.successors)
            task.free_slack = max(0, min_es_successor - task.end)
        else:
            task.free_slack = project_duration - task.end

    return tasks

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/edit', methods=['GET', 'POST'])
def edit():
    if request.method == 'POST':
        tasks_json = request.form.get('tasks', '[]')
        tasks_data = json.loads(tasks_json)
        return render_template('index.html', tasks=tasks_data)
    return render_template('index.html')

@app.route('/gantt', methods=['POST'])
def gantt():
    tasks_json = request.form.get('tasks', '[]')
    tasks_data = json.loads(tasks_json)

    tasks = compute_gantt_schedule(tasks_data)
    tasks_dict = [task.to_dict() for task in tasks]

    return render_template('gantt.html', tasks=tasks_dict)


if __name__ == '__main__':
    app.run(debug=True)