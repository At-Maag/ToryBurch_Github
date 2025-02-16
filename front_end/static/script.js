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
}
