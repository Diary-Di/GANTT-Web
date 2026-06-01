from flask import Flask, render_template, request
import json
from datetime import datetime

app = Flask(__name__)

class Task:
    def __init__(self, id, name, duration, predecessor=None):
        self.id = id
        self.name = name
        self.duration = int(duration)
        self.predecessor = predecessor.strip() if predecessor else None
        self.start = 0
        self.end = 0
        self.successors = []  # Sera rempli plus tard

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'duration': self.duration,
            'predecessor': self.predecessor,
            'start': self.start,
            'end': self.end
        }


def compute_gantt_schedule(tasks_data):
    """Calcule les dates de début et fin des tâches (méthode du chemin critique)"""
    tasks = []
    task_dict = {}  # Pour retrouver facilement une tâche par son nom

    # Création des objets Task
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

    # === Forward Pass : Calcul des Early Start / Early Finish ===
    for task in tasks:
        if not task.predecessor:
            task.start = 0
        else:
            pred = task_dict.get(task.predecessor)
            if pred:
                task.start = pred.end
            else:
                task.start = 0
        
        task.end = task.start + task.duration

    return tasks


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/gantt', methods=['POST'])
def gantt():
    tasks_json = request.form.get('tasks', '[]')
    tasks_data = json.loads(tasks_json)

    # Calcul de l'ordonnancement
    tasks = compute_gantt_schedule(tasks_data)

    # Conversion en dictionnaires pour Jinja
    tasks_dict = [task.to_dict() for task in tasks]

    return render_template('gantt.html', tasks=tasks_dict)


if __name__ == '__main__':
    app.run(debug=True)