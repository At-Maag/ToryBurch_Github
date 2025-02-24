from flask import Flask, render_template, request, jsonify, send_from_directory
from collections import defaultdict
from flask_cors import CORS
import json
import os
from datetime import datetime

# ✅ Initialize Flask App
app = Flask(__name__, template_folder="../front_end/templates", static_folder="../front_end/static")
CORS(app)

# ✅ Define paths for JSON files
DATA_DIR = os.path.join(os.path.dirname(__file__), '../data')
CUSTOMERS_FILE = os.path.join(DATA_DIR, 'tory_burch_customers.json')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'tory_burch_products.json')
PURCHASE_HISTORY_FILE = os.path.join(DATA_DIR, 'tory_burch_purchase_history.json')

# ✅ Load JSON Data Function
def load_json(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found")
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# ✅ Load product data at startup
products = load_json(PRODUCTS_FILE)

# 🌟 HOME PAGE (STORE)
@app.route('/')
def store():
    return render_template('index.html')

# 👜 CATEGORY PAGE
@app.route('/category')
def category():
    return render_template('category.html')

# 🛍️ PRODUCT DETAIL PAGE
@app.route('/product')
def product():
    return render_template('product.html')

# 📇 CUSTOMER LOOKUP (BACKEND PAGE)
@app.route('/backend')
def backend():
    return render_template('backend.html')

@app.route('/product.html')
def product_page():
    return render_template('product.html')

#👜 Product Page
@app.route('/get_product_by_id', methods=['GET'])
def get_product_by_id():
    style_number = request.args.get('style-number')
    color_code = request.args.get('color-code')

    product = next((p for p in products if str(p.get("style-number")) == style_number and str(p.get("color-code")) == color_code), None)

    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404


# 🌍 API: Get all products
@app.route('/get_products')
def get_products():
    for product in products:
        if not product.get('bag-type'):  # Assign "Other Bags" if missing
            product['bag-type'] = "Other Bags"
    return jsonify(products)

# 🌍 API: Get products by category
@app.route('/get_category_products')
def get_category_products():
    category = request.args.get('type')
    return jsonify([p for p in products if p['bag-type'] == category])

# 🌍 API: Get single product
@app.route('/get_product')
def get_product():
    product_id = request.args.get('product_id')
    product = next((p for p in products if str(p.get("id")) == product_id), None)
    return jsonify(product) if product else ('Not Found', 404)

# 🔎 CUSTOMER LOOKUP FUNCTION
@app.route('/lookup', methods=['POST'])
def lookup_customer():
    query = request.form.get('name', '').strip().lower()
    if not query:
        return jsonify(result=[])

    customers = load_json(CUSTOMERS_FILE)
    purchase_history = load_json(PURCHASE_HISTORY_FILE)

    result = []
    for customer in customers:
        full_name = f"{customer['first_name']} {customer['last_name']}".lower()
        if query == customer['customer_id'] or query in full_name:
            customer_purchases = []
            grouped_purchases = defaultdict(list)

            for h in purchase_history:
                if h['customer_id'] == customer['customer_id']:
                    style_number = h['product_id'].split('-')[0]  

                    # ✅ Find the product and assign "Other Bags" if `bag-type` is missing
                    product_info = next((p for p in products if str(p.get("style-number", "")) == style_number), None)
                    product_name = product_info["name"] if product_info else "N/A"
                    bag_type = product_info.get("bag-type", "Other Bags") if product_info else "Other Bags"

                    try:
                        raw_date = h.get("date", "Unknown Date").strip()
                        formatted_date = datetime.strptime(raw_date, "%m/%d/%Y").strftime("%Y-%m-%d") \
                            if "/" in raw_date else datetime.strptime(raw_date, "%Y-%m-%d").strftime("%Y-%m-%d")
                    except ValueError:
                        formatted_date = "Unknown Date"

                    grouped_purchases[style_number].append({
                        "purchase_date": formatted_date,
                        "product_id": h.get("product_id"),
                        "quantity": h.get("quantity", 0),
                        "total_amount": h.get("total_amount", "$0.00"),
                        "store_location": h.get("store_location", "Unknown"),
                        "payment_method": h.get("payment_method", "Unknown"),
                        "bag_type": bag_type  # ✅ Assign bag-type including "Other Bags"
                    })

            for style_number, purchases in grouped_purchases.items():
                total_quantity = sum(p["quantity"] for p in purchases)
                total_amount = sum(float(p["total_amount"].replace("$", "")) for p in purchases)

                customer_purchases.append({
                    "style_number": style_number,
                    "product_name": product_name,
                    "bag_type": purchases[0]["bag_type"],  # ✅ Ensure all purchases under this style number share a bag type
                    "total_quantity": total_quantity,
                    "total_amount": f"${total_amount:.2f}",
                    "purchases": purchases
                })

            customer_info = {
                "customer_id": customer.get("customer_id", "N/A"),
                "first_name": customer.get("first_name", "N/A"),
                "last_name": customer.get("last_name", "N/A"),
                "email": customer.get("email", "N/A"),
                "phone": customer.get("phone_number", "N/A"),
                "purchase_history": customer_purchases
            }

            result.append(customer_info)

    return jsonify(result=result)

# 🔍 CUSTOMER SEARCH AUTOCOMPLETE
@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    query = request.args.get('query', '').strip().lower()
    if not query:
        return jsonify([])

    customers = load_json(CUSTOMERS_FILE)
    matches = []

    for customer in customers:
        first_name = customer.get("first_name", "").strip().lower()
        last_name = customer.get("last_name", "").strip().lower()
        customer_id = str(customer.get("customer_id", ""))

        if query in first_name or query in last_name or query in customer_id:
            matches.append({
                "customer_id": customer_id,
                "first_name": customer.get("first_name", "N/A"),
                "last_name": customer.get("last_name", "N/A"),
                "email": customer.get("email", "N/A")
            })

    return jsonify(matches[:5])

# ✅ Run Flask Server
if __name__ == "__main__":
    app.run(debug=True)
