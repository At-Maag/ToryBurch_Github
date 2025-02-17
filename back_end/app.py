from flask import Flask, render_template, request, jsonify
from collections import defaultdict
import json
import os

app = Flask(__name__, template_folder="../front_end/templates", static_folder="../front_end/static")


def load_json(file_name):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, f'../data/{file_name}')) as f:
        return json.load(f)


def get_product_category(product_id, products):
    style_number = product_id.split('-')[0] if '-' in product_id else product_id
    for product in products:
        if str(product.get("style-number", "")) == style_number:
            return product.get("bag-type", "Other") if product.get("bag-type") else "Other"
    return "Other"


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/backend')
def backend():
    return render_template('backend.html')


@app.route('/lookup', methods=['POST'])
def lookup_customer():
    query = request.form['name']
    customers = load_json('tory_burch_customers.json')
    purchase_history = load_json('tory_burch_purchase_history.json')
    products = load_json('tory_burch_products.json')

    result = []
    for customer in customers:
        if query.isdigit() and customer['customer_id'] == query or query.lower() in (customer['first_name'].lower() + " " + customer['last_name'].lower()):
            grouped_purchases = defaultdict(list)

            for h in purchase_history:
                if h['customer_id'] == customer['customer_id']:
                    product = next((p for p in products if str(p.get("style-number", "")) == h["product_id"].split('-')[0]), None)
                    bag_type = product.get("bag-type", "Other") if product else "Other"

                    grouped_purchases[h['product_id']].append({
                        "purchase_date": h.get("date", "Unknown Date"),
                        "quantity": h.get("quantity", 0),
                        "total_amount": h.get("total_amount", "$0.00"),
                        "store_location": h.get("store_location", "Unknown"),
                        "payment_method": h.get("payment_method", "Unknown"),
                        "bag_type": bag_type
                    })

            customer_purchases = []
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
