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
    const totalQuantity = purchase.purchases.reduce((sum, p) => sum + p.quantity, 0);

    const row = document.createElement('tr');
    
    let purchaseHTML = `
      <td>${purchase.product_id || 'N/A'}</td>
      <td>${purchase.product_name}</td>
    `;

    if (purchase.purchases.length > 1) {
      // Replace Date field with "View Dates" button
      purchaseHTML += `
        <td><button class="expand-btn">View Dates</button></td>
      `;
    } else {
      // If only one purchase, show Date directly
      purchaseHTML += `
        <td>${purchase.purchases[0].purchase_date}</td>
      `;
    }

    // Always show total quantity
    purchaseHTML += `<td>${totalQuantity}</td>`;

    row.innerHTML = purchaseHTML;
    tableBody.appendChild(row);

    if (purchase.purchases.length > 1) {
      // Create a hidden row for expandable details
      const detailRow = document.createElement('tr');
      detailRow.style.display = 'none';
      detailRow.innerHTML = `
        <td colspan="4">
          <table class="sub-table">
            <tr><th>Date</th><th>Quantity</th><th>Total Amount</th><th>Store</th><th>Payment</th></tr>
            ${purchase.purchases.map(p => `
              <tr>
                <td>${p.purchase_date}</td>
                <td>${p.quantity}</td>
                <td>${p.total_amount}</td>
                <td>${p.store_location}</td>
                <td>${p.payment_method}</td>
              </tr>
            `).join('')}
          </table>
        </td>
      `;
      tableBody.appendChild(detailRow);

      // Add event listener for expanding rows
      row.querySelector('.expand-btn').addEventListener('click', () => {
        detailRow.style.display = detailRow.style.display === 'none' ? '' : 'none';
      });
    }
  });
}

function populateCategoryFilter(purchaseHistory, products) {
  const filterContainer = document.getElementById('category-filter');
  filterContainer.innerHTML = '';

  let categories = new Set();
  purchaseHistory.forEach(purchase => {
    purchase.purchases.forEach(p => {
      const product = products.find(prod => prod["style-number"] === purchase.product_id.split('-')[0]);
      const bagType = product && product["bag-type"] ? product["bag-type"] : "Other";
      categories.add(bagType);
    });
  });

  // Convert Set to Array & Sort
  let categoryArray = Array.from(categories).sort();
  categoryArray.unshift("All");  // Add "All" at the top

  // Create filter UI
  categoryArray.forEach(category => {
    const filterOption = document.createElement('div');
    filterOption.classList.add('filter-option');
    filterOption.innerHTML = `
      <input type="radio" name="category" value="${category}" ${category === "All" ? "checked" : ""}>
      <label>${category}</label>
    `;
    filterContainer.appendChild(filterOption);
  });

  // Add event listener for filtering logic
  document.querySelectorAll('input[name="category"]').forEach(input => {
    input.addEventListener('change', () => {
      applyCategoryFilter(input.value, purchaseHistory, products);
    });
  });
}

function applyCategoryFilter(selectedCategory, purchaseHistory, products) {
  let filteredHistory;

  if (selectedCategory === "All") {
    filteredHistory = purchaseHistory;
  } else {
    filteredHistory = purchaseHistory.filter(purchase => {
      return purchase.purchases.some(p => {
        const product = products.find(prod => prod["style-number"] === purchase.product_id.split('-')[0]);
        const bagType = product && product["bag-type"] ? product["bag-type"] : "Other";
        return bagType === selectedCategory;
      });
    });
  }

  // Re-populate the table with the filtered data
  populatePurchaseHistory(filteredHistory);
}
