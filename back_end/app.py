from flask import Flask, render_template, request, jsonify
from collections import defaultdict
import json
import os

app = Flask(__name__, template_folder="../front_end/templates", static_folder="../front_end/static")

# Helper function to load JSON data
def load_json(file_name):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, f'../data/{file_name}')
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found")
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Route for main customer lookup page
@app.route('/backend')
def backend():
    return render_template('backend.html')

# Customer search endpoint
@app.route('/lookup', methods=['POST'])
def lookup_customer():
    query = request.form.get('name', '').strip().lower()
    if not query:
        return jsonify(result=[])

    customers = load_json('tory_burch_customers.json')
    purchase_history = load_json('tory_burch_purchase_history.json')
    products = load_json('tory_burch_products.json')

    result = []
    for customer in customers:
        full_name = f"{customer['first_name']} {customer['last_name']}".lower()
        if query == customer['customer_id'] or query in full_name:
            customer_purchases = []

            grouped_purchases = defaultdict(list)
            for h in purchase_history:
                if h['customer_id'] == customer['customer_id']:
                    grouped_purchases[h['product_id']].append({
                        "purchase_date": h.get("date", "Unknown Date"),
                        "quantity": h.get("quantity", 0),
                        "total_amount": h.get("total_amount", "$0.00"),
                        "store_location": h.get("store_location", "Unknown"),
                        "payment_method": h.get("payment_method", "Unknown")
                    })

            for product_id, purchases in grouped_purchases.items():
                product_name = next((p["name"] for p in products if str(p.get("style-number", "")) == product_id.split('-')[0]), "Unknown Product")

                customer_purchases.append({
                    "product_id": product_id,
                    "product_name": product_name,
                    "purchases": purchases
                })

            customer['purchase_history'] = customer_purchases
            result.append(customer)

    return jsonify(result=result)

if __name__ == "__main__":
    app.run(debug=True)
