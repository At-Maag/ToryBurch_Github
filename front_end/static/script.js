document.getElementById('lookup-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const formData = new FormData(this);

  fetch('/lookup', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.result.length > 0) {
      const customer = data.result[0];
      populateCustomerDetails(customer);
      populatePurchaseHistory(customer.purchase_history);
      populateCategoryFilters(customer.purchase_history);
    } else {
      alert('No customer found.');
    }
  });
});

function populateCustomerDetails(customer) {
  document.getElementById('customer-id').innerText = customer.customer_id;
  document.getElementById('customer-name').innerText = `${customer.first_name} ${customer.last_name}`;
  document.getElementById('customer-email').innerText = customer.email;
  document.getElementById('customer-phone').innerText = customer.phone_number;
}

function populatePurchaseHistory(purchaseHistory) {
  const tableBody = document.querySelector('#history-table tbody');
  tableBody.innerHTML = '';
  purchaseHistory.forEach(purchase => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${purchase.product_id || 'N/A'}</td>
      <td>${purchase.product_name}</td>
      <td>${purchase.purchase_date}</td>
      <td>${purchase.quantity}</td>
    `;
    tableBody.appendChild(row);
  });

  addSortingToDateColumn();
}

function populateCategoryFilters(purchaseHistory) {
  const categories = [...new Set(purchaseHistory.map(p => p.category))].sort();
  const filterTable = document.getElementById('category-filters');
  filterTable.innerHTML = '';

  categories.forEach(category => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" class="category-filter" value="${category}" checked></td>
      <td>${category}</td>
    `;
    filterTable.appendChild(row);
  });

  document.querySelectorAll('.category-filter').forEach(checkbox => {
    checkbox.addEventListener('change', filterPurchaseHistory);
  });
}

function filterPurchaseHistory() {
  const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
  const rows = document.querySelectorAll('#history-table tbody tr');
  
  rows.forEach(row => {
    const category = row.cells[1].innerText;
    row.style.display = selectedCategories.includes(category) ? '' : 'none';
  });
}


function addSortingToDateColumn() {
  const dateHeader = document.querySelector('#history-table th:nth-child(3)');
  dateHeader.style.cursor = 'pointer';
  
  dateHeader.addEventListener('click', () => {
    const rows = Array.from(document.querySelectorAll('#history-table tbody tr'));
    const sortedRows = rows.sort((a, b) => {
      const dateA = new Date(a.cells[2].innerText);
      const dateB = new Date(b.cells[2].innerText);
      return dateA - dateB;
    });
    
    const tableBody = document.querySelector('#history-table tbody');
    tableBody.innerHTML = '';
    sortedRows.forEach(row => tableBody.appendChild(row));
  });
}

// Autofill suggestions for customer name
const nameInput = document.getElementById('name');
nameInput.addEventListener('input', function() {
  const query = this.value;
  if (query.length > 0) {
    fetch(`/autocomplete?term=${query}`)
      .then(response => response.json())
      .then(data => {
        const suggestionBox = document.getElementById('suggestions');
        suggestionBox.innerHTML = '';
        data.suggestions.forEach(name => {
          suggestionBox.innerHTML += `<option value="${name}">`;
        });
      });
  }
});
