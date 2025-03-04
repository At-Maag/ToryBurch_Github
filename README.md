## Tory Burch Web Application

### Made By: At Maag, Pilar Flores, Tatiana Obando, David Eliason

## **Overview**

At Tory Burch, we had a problem of not being able to look up customer information easily to see if a customer hit their limit of 5 bags. We had to manually check their purchase history one by one, which was really time-consuming. There was a policy that a customer could not buy more than 5 of the same product (style number) across different colors, but there was no efficient way for us to look this up. To solve this, we created an application that allows users to look up customer history efficiently.

[Project Video](https://drive.google.com/file/d/1NoaF0qR6C6F4gTjm-zUBDG6hULGG1xgw/view?usp=sharing)

---

## **Project Structure**

```
TORYBURCH_GITHUB/
│
├── back_end/
│   └── app.py                # Flask application
├── data/
│   └── tory_burch_customers.json        # Customer data
|   |── tory_burch_products.json    
|   |── tory_burch_purchase_history.json    
├── front_end/
│   ├── static/
│   │   ├── style.css         # CSS file
│   │   └── script.js         # JavaScript file
│   └── templates/
│       ├── index.html        # Home page
│       └── backend.html      # Backend page for customer lookup
└── venv/                     # Virtual environment
```

---

## **Setup Instructions**

### **1. Clone the Repository**

Ensure you have Git installed. Then, run:

```bash
git clone https://github.com/Thitiat-Pidtatasang/ToryBurch_Github.git
cd ToryBurch_Github
```

### **2. Set Up a Virtual Environment**

Ensure you have Python 3 installed, then create and activate a virtual environment:

- **Linux/Mac:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
- **Windows:**
  ```bash
  python -m venv venv
  .\venv\Scripts\activate
  ```

### **3. Install Dependencies**

Inside the virtual environment, install Flask:

```bash
pip install flask
```

### **4. Run the Application**

Start the Flask application:

```bash
python back_end/app.py
```

If successful, you should see:

```
Running on http://127.0.0.1:5000/
```

### **5. Access the Web App**

Open your browser and visit:

```
http://127.0.0.1:5000/
```

---

## **Troubleshooting**

### **1. **``

Ensure Flask is installed inside the virtual environment:

```bash
pip install flask
```

### **2. Virtual Environment Activation Issues**

- Ensure you're inside the correct project directory.
- Try reactivating the virtual environment.

### **3. Deactivating the Virtual Environment**

To exit the virtual environment:

```bash
deactivate
```

