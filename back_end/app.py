from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__, template_folder="../front_end/templates", static_folder="../front_end/static")

recent_searches = []  # Store recent searches

def load_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, '../data/customers.json')
    with open(file_path) as f:
        return json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/backend')
def backend():
    return render_template('backend.html')

@app.route('/lookup', methods=['POST'])
def lookup_customer():
    query = request.form['name']
    customers = load_data()
    global recent_searches
    recent_searches = [query] + recent_searches[:9]

    if query.isdigit():
        result = [customer for customer in customers if customer.get('id') == int(query)]
    else:
        result = [customer for customer in customers if query.lower() in customer['name'].lower()]

    return jsonify(result=result)

@app.route('/recent')
def get_recent():
    return jsonify(recent=recent_searches)

@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    query = request.args.get('term', '')
    customers = load_data()
    suggestions = [customer['name'] for customer in customers if query.lower() in customer['name'].lower()]
    return jsonify(suggestions=suggestions)

if __name__ == "__main__":
    app.run(debug=True)
