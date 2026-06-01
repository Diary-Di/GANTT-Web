from flask import Flask, render_template, request
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gantt', methods=['POST'])
def gantt():
    tasks_json = request.form.get('tasks', '[]')
    tasks = json.loads(tasks_json)
    return render_template('gantt.html', tasks=tasks)

if __name__ == '__main__':
    app.run(debug=True)