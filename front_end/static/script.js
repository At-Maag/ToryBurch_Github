document.getElementById('lookup-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const query = document.getElementById('customer-name').value.trim();
  if (query.length === 0) {
      alert("Please enter a name or ID");
      return;
  }

  fetch('/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'name': query })
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
  document.getElementById('customer-id').textContent = customer.customer_id || 'N/A';

  let fullName = (customer.first_name && customer.last_name) 
      ? `${customer.first_name} ${customer.last_name}` 
      : "N/A";
      document.getElementById('customer-name-display').textContent = fullName;

  document.getElementById('customer-email').textContent = customer.email || 'N/A';
  document.getElementById('customer-phone').textContent = customer.phone && customer.phone !== "N/A" ? customer.phone : "N/A";
}

function clearCustomerDetails() {
  document.getElementById('customer-id').textContent = '';
  document.getElementById('customer-name').textContent = '';
  document.getElementById('customer-email').textContent = '';
  document.getElementById('customer-phone').textContent = '';
  document.getElementById('purchase-history-body').innerHTML = '<tr><td colspan="5">No Purchase History</td></tr>';
}



function populatePurchaseHistory(purchaseHistory) {
  const tableBody = document.getElementById('purchase-history-body');
  tableBody.innerHTML = ''; 

  if (purchaseHistory.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">No Purchase History</td></tr>';
      return;
  }

  purchaseHistory.forEach((purchase, index) => {
      let row = document.createElement('tr');
      row.innerHTML = `
          <td>${purchase.style_number || 'N/A'}</td>  
          <td>${purchase.product_name || 'N/A'}</td>  
          <td>
              ${purchase.purchases.length > 1 
                  ? `<button class="expand-btn" onclick="toggleDetails(${index})">Expand</button>` 
                  : purchase.purchases[0]?.purchase_date || 'N/A'}
          </td>
          <td>${purchase.total_quantity}</td>
          <td>${purchase.total_amount}</td>
      `;
      tableBody.appendChild(row);

      if (purchase.purchases.length > 1) {
          let subTableRow = document.createElement('tr');
          subTableRow.id = `details-${index}`;
          subTableRow.classList.add("sub-table-row", "hidden");
          subTableRow.innerHTML = `
              <td colspan="5">
                  <table class="sub-table">
                      <thead>
                          <tr>
                              <th>Product ID</th>
                              <th>Date</th>
                              <th>Store</th>
                              <th>Quantity</th>
                              <th>Amount</th>
                              <th>Payment Method</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${purchase.purchases.map(p => `
                              <tr>
                                  <td>${p.product_id}</td>
                                  <td>${p.purchase_date}</td>
                                  <td>${p.store_location}</td>
                                  <td>${p.quantity}</td>
                                  <td>${p.total_amount}</td>
                                  <td>${p.payment_method}</td>
                              </tr>
                          `).join('')}
                      </tbody>
                  </table>
              </td>
          `;
          tableBody.appendChild(subTableRow);
      }
  });
}

function toggleDetails(index) {
  let subTable = document.getElementById(`details-${index}`);
  if (subTable) {
      if (subTable.style.display === "none" || subTable.classList.contains("hidden")) {
          subTable.style.display = "table-row";  // ✅ Ensures it appears immediately
          subTable.classList.remove("hidden");
      } else {
          subTable.style.display = "none";  // ✅ Ensures it hides immediately
          subTable.classList.add("hidden");
      }
  }
}


