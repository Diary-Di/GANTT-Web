from flask import Flask, render_template, request
import json

app = Flask(__name__)

class Task:
    def __init__(self, id, name, duration, predecessor=None):
        self.id = id
        self.name = name
        self.duration = int(duration)
        self.predecessor = predecessor.strip() if predecessor and predecessor != '—' else None
        self.start = 0          # Early Start (ES)
        self.end = 0            # Early Finish (EF)
        self.late_start = 0     # Late Start (LS)
        self.late_end = 0       # Late Finish (LF)
        self.slack = 0
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
            predecessor=t.get('predecessor')
        )
        tasks.append(task)
        task_dict[task.name] = task

    # Construction des successeurs
    for task in tasks:
        if task.predecessor and task.predecessor in task_dict:
            task_dict[task.predecessor].successors.append(task)

    # ==================== FORWARD PASS ====================
    for task in tasks:
        if not task.predecessor:
            task.start = 0
        else:
            pred = task_dict.get(task.predecessor)
            task.start = pred.end if pred else 0
        
        task.end = task.start + task.duration

    # ==================== BACKWARD PASS ====================
    project_duration = max(task.end for task in tasks)

    # Initialisation des Late Start/End
    for task in tasks:
        task.late_end = project_duration
        task.late_start = task.late_end - task.duration

    # Calcul backward (du dernier au premier)
    for task in reversed(tasks):
        if task.successors:
            min_successor_start = min(s.start for s in task.successors)
            task.late_end = min_successor_start
            task.late_start = task.late_end - task.duration

    # Calcul du slack et identification du chemin critique
    for task in tasks:
        task.slack = task.late_start - task.start
        task.is_critical = task.slack == 0

    return tasks


@app.route('/')
def index():
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