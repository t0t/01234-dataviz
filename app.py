from flask import Flask, render_template
from pymongo import MongoClient

app = Flask(__name__)

# Conexión a MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['personal_knowledge_project']
entries = db['entries']

@app.route('/')
def index():
    # Recuperar entradas desde MongoDB
    all_entries = list(entries.find())
    return render_template('index.html', entries=all_entries)

if __name__ == '__main__':
    app.run(debug=True)
