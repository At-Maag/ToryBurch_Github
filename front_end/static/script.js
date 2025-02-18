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
      subTable.classList.toggle("hidden");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
    const filterContainer = document.getElementById("filter-options");
    const purchaseTable = document.getElementById("purchase-history-body");

    try {
        let response = await fetch("/data/tory_burch_products.json");
        let products = await response.json();

        let bagTypeMap = {};  // Move this to a global variable
        let categories = new Set();

        products.forEach(product => {
            let bagType = product["bag-type"];

            // Assign a default category if bag-type is null, empty, or missing
            if (!bagType || bagType === null || bagType.trim() === "") {
                bagType = "Other Bags";
            }

            bagTypeMap[product["style-number"]] = bagType;
            categories.add(bagType);
        });

        // **Attach bagTypeMap to the global window object**
        window.bagTypeMap = bagTypeMap;

        // **Update filter options**
        filterContainer.innerHTML = "";

        let sortedCategories = Array.from(categories).filter(c => c !== "Other Bags").sort();
        sortedCategories.unshift("All");
        sortedCategories.push("Other Bags");
        sortedCategories = sortedCategories.map(category => category.replace("|", "").trim());

        sortedCategories.forEach(category => {
            let label = document.createElement("label");
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "bag-filter";
            checkbox.value = category;
            if (category === "All") checkbox.checked = true;

            checkbox.addEventListener("change", function () {
                handleFilterSelection(category);
            });

            label.appendChild(checkbox);
            label.append(` ${category}`);
            filterContainer.appendChild(label);
        });

        // **Ensure filtering updates the table when categories are ready**
        updateTableDisplay();

    } catch (error) {
        console.error("Error loading bag type data:", error);
    }
});


function handleFilterSelection(category) {
    let allCheckbox = document.querySelector('input[name="bag-filter"][value="All"]');
    let checkboxes = document.querySelectorAll('input[name="bag-filter"]');

    if (category === "All") {
        checkboxes.forEach(checkbox => {
            checkbox.checked = allCheckbox.checked;
        });
    } else {
        allCheckbox.checked = false;
    }

    let selectedCategories = Array.from(document.querySelectorAll('input[name="bag-filter"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedCategories.length === 0) {
        allCheckbox.checked = true;
    }

    // **Explicitly call updateTableDisplay() to refresh the table**
    updateTableDisplay();
}

function updateTableDisplay() {
    let selectedCategories = Array.from(document.querySelectorAll('input[name="bag-filter"]:checked'))
        .map(checkbox => checkbox.value);

    let allSelected = selectedCategories.includes("All");
    let rows = document.querySelectorAll("#purchase-history-body tr");

    rows.forEach(row => {
        let styleNumberCell = row.querySelector("td:first-child");
        if (!styleNumberCell) return; // Prevent errors if row structure is different

        let styleNumber = styleNumberCell.textContent.trim();
        let productCategory = window.bagTypeMap[styleNumber] || "Other Bags";

        // **Check if product belongs to selected categories and update visibility**
        if (allSelected || selectedCategories.includes(productCategory)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

