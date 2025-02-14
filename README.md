##Tory Burch Web Application
###Made By: At, Pilar, Tatiana, David Eliason

## **Overview**  
The Tory Burch web application is a Flask-based project that allows users to view featured products and perform customer lookups. This guide provides instructions on how to install dependencies, set up the environment, and run the application.

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

### **1. `ModuleNotFoundError: No module named 'flask'`**  
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


