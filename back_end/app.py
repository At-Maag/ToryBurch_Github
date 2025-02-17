from flask import Flask, render_template, request, jsonify
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
        if query.isdigit() and customer['customer_id'] == query:
            customer_purchases = [
                {
                    "product_id": h.get("product_id", ""),
                    "product_name": h.get("product_name", "Unknown Product"),
                    "purchase_date": h.get("date", "Unknown Date"),
                    "quantity": h.get("quantity", 0),
                    "category": get_product_category(h.get("product_id", ""), products)
                }
                for h in purchase_history if h.get('customer_id') == query
            ]
            customer['purchase_history'] = customer_purchases
            result.append(customer)
        elif query.lower() in (customer['first_name'].lower() + " " + customer['last_name'].lower()):
            customer_purchases = [
                {
                    "product_id": h.get("product_id", ""),
                    "product_name": h.get("product_name", "Unknown Product"),
                    "purchase_date": h.get("date", "Unknown Date"),
                    "quantity": h.get("quantity", 0),
                    "category": get_product_category(h.get("product_id", ""), products)
                }
                for h in purchase_history if h['customer_id'] == customer['customer_id']
            ]
            customer['purchase_history'] = customer_purchases
            result.append(customer)

    return jsonify(result=result)


if __name__ == "__main__":
    app.run(debug=True)
