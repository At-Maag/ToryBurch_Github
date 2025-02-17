document.getElementById('lookup-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const query = document.getElementById('customer-search').value.trim();
  if (query.length === 0) {
      alert("Please enter a name or ID");
      return;
  }

  const formData = new FormData();
  formData.append('name', query);

  fetch('/lookup', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      if (data.result.length > 0) {
          populateCustomerDetails(data.result[0]);
          populatePurchaseHistory(data.result[0].purchase_history);
      } else {
          alert('No customer found.');
          clearCustomerDetails();
      }
  })
  .catch(error => console.error('Error fetching customer details:', error));
});

function populateCustomerDetails(customer) {
  document.getElementById('customer-id').innerText = customer.customer_id || "N/A";
  document.getElementById('customer-name').innerText = `${customer.first_name || "N/A"} ${customer.last_name || "N/A"}`;
  document.getElementById('customer-email').innerText = customer.email || "N/A";
  document.getElementById('customer-phone').innerText = customer.phone_number || "N/A";
}

function clearCustomerDetails() {
  document.getElementById('customer-id').innerText = "";
  document.getElementById('customer-name').innerText = "";
  document.getElementById('customer-email').innerText = "";
  document.getElementById('customer-phone').innerText = "";
}

function populatePurchaseHistory(purchaseHistory) {
  const tableBody = document.getElementById('purchase-history-body');
  tableBody.innerHTML = ''; 

  if (purchaseHistory.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4">No Purchase History</td></tr>';
      return;
  }

  purchaseHistory.forEach(purchase => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${purchase.product_id || 'N/A'}</td>
          <td>${purchase.product_name || 'N/A'}</td>
          <td>${purchase.purchases[0]?.purchase_date || 'N/A'}</td>
          <td>${purchase.purchases.reduce((sum, p) => sum + p.quantity, 0)}</td>
      `;
      tableBody.appendChild(row);
  });
}
