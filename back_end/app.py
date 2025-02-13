from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__, template_folder="../front_end/templates", static_folder="../front_end/static")

recent_searches = []  # Store recent searches

def load_customers():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, '../data/tory_burch_customers.json')) as f:
        return json.load(f)

def load_purchase_history():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, '../data/tory_burch_purchase_history.json')) as f:
        return json.load(f)

def load_products():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, '../data/tory_burch_products.json')) as f:
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
    customers = load_customers()
    purchase_history = load_purchase_history()
    products = load_products()

    global recent_searches
    recent_searches = [query] + recent_searches[:9]

    result = []
    for customer in customers:
        if query.isdigit() and customer['customer_id'] == query:
            customer_purchases = [
                {
                    "product_id": h['style_number'],
                    "product_name": next((p["product_name"] for p in products if p["style_number"] == h["style_number"]), "Unknown Product"),
                    "purchase_date": h['purchase_date'],
                    "quantity": h['quantity'],
                    "category": next((p["category"] for p in products if p["style_number"] == h["style_number"]), "Unknown Category")
                }
                for h in purchase_history if h['customer_id'] == query
            ]
            customer['purchase_history'] = customer_purchases
            result.append(customer)
        elif query.lower() in (customer['first_name'].lower() + " " + customer['last_name'].lower()):
            customer_purchases = [
                {
                    "product_id": h['style_number'],
                    "product_name": next((p["product_name"] for p in products if p["style_number"] == h["style_number"]), "Unknown Product"),
                    "purchase_date": h['purchase_date'],
                    "quantity": h['quantity'],
                    "category": next((p["category"] for p in products if p["style_number"] == h["style_number"]), "Unknown Category")
                }
                for h in purchase_history if h['customer_id'] == customer['customer_id']
            ]
            customer['purchase_history'] = customer_purchases
            result.append(customer)

    return jsonify(result=result)

@app.route('/recent')
def get_recent():
    return jsonify(recent=recent_searches)

@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    query = request.args.get('term', '')
    customers = load_customers()
    suggestions = [f"{c['first_name']} {c['last_name']}" for c in customers if query.lower() in (c['first_name'].lower() + " " + c['last_name'].lower())]
    return jsonify(suggestions=suggestions)

if __name__ == "__main__":
    app.run(debug=True)
