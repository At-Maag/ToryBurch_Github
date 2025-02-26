let allProducts = [];

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
  
 
  
  function toggleDetails(index, button) {
    let detailsRow = document.getElementById(`details-${index}`);
    let triangle = button.querySelector(".triangle");

    if (detailsRow.classList.contains("visible")) {
        detailsRow.classList.remove("visible");
        detailsRow.style.display = "none";
        triangle.textContent = "▼";  // Collapse state
    } else {
        detailsRow.classList.add("visible");
        detailsRow.style.display = "table-row";
        triangle.textContent = "▲";  // Expanded state
    }
}
  
  document.addEventListener("DOMContentLoaded", async function () {
      const filterContainer = document.getElementById("filter-options");
  
      try {
        let response = await fetch("/get_products");
        window.allProducts = await response.json();

        // ✅ Ensure `allProducts` is available before loading customer data
        console.log("Products loaded:", window.allProducts);
  
          let categories = new Set();
          products.forEach(product => {
              let bagType = product["bag-type"] || "Other Bags";
              bagType = bagType.replace("|", "").trim();
              categories.add(bagType);
          });
  
          let sortedCategories = Array.from(categories).filter(c => c !== "Other Bags").sort();
          sortedCategories.push("Other Bags"); // Keep "Other Bags" at the bottom
  
          filterContainer.innerHTML = "";  
  
          // Create "All" checkbox (default checked)
          let allLabel = document.createElement("label");
          allLabel.style.display = "block";
          let allCheckbox = document.createElement("input");
          allCheckbox.type = "checkbox";
          allCheckbox.value = "All";
          allCheckbox.checked = true;  
          allCheckbox.addEventListener("change", function () {
              if (this.checked) {
                  selectAll();
              }
          });
          allLabel.appendChild(allCheckbox);
          allLabel.append(" All");
          filterContainer.appendChild(allLabel);
  
          let checkboxes = [];
  
          sortedCategories.forEach(category => {
              let label = document.createElement("label");
              label.style.display = "block";
  
              let checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.name = "bag-filter";
              checkbox.value = category;
              checkbox.checked = (category === "All" || category === "Other Bags");  // Default check both
  
              checkbox.addEventListener("change", function () {
                  handleCategorySelection();
              });
  
              label.appendChild(checkbox);
              label.append(` ${category}`);
              filterContainer.appendChild(label);
              checkboxes.push(checkbox);
          });
  
          function selectAll() {
              checkboxes.forEach(checkbox => checkbox.checked = false);
              allCheckbox.checked = true;
              filterProducts();
          }
  
          function handleCategorySelection() {
            let checkboxes = document.querySelectorAll('input[name="bag-filter"]');
            let checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);
        
            if (checkedBoxes.length === 0) {
                // ✅ If nothing is selected, reselect "All" and "Other Bags"
                checkboxes.forEach(cb => {
                    if (cb.value === "All" || cb.value === "Other Bags") {
                        cb.checked = true;
                    }
                });
            }
        
            filterProducts(); // ✅ Make sure filtering happens immediately
        }
  
          function filterProducts() {
              let selectedCategories = new Set();
              if (allCheckbox.checked) {
                  selectedCategories.add("All");  // ✅ Ensure "All" is handled
              } else {
                  checkboxes.forEach(cb => {
                      if (cb.checked) {
                          selectedCategories.add(cb.value);
                      }
                  });
              }
  
              let rows = document.querySelectorAll("#purchase-history-body tr");
  
              rows.forEach(row => {
                  let categoryCell = row.querySelector("td:nth-child(3)");  // Adjust based on table structure
                  if (!categoryCell) return;
  
                  let bagType = categoryCell.textContent.trim();
                  if (selectedCategories.has("All") || selectedCategories.has(bagType)) {
                      row.style.display = "";
                  } else {
                      row.style.display = "none";
                  }
              });
          }
  
          // Initial filter to show "All" at first
          filterProducts();
  
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
        if (!styleNumberCell) return;

        let styleNumber = styleNumberCell.textContent.trim();
        let productMatch = window.allProducts.find(p => p["style-number"].toString() === styleNumber);
        let bagType = productMatch ? (productMatch["bag-type"] || "Other Bags").replace("|", "").trim() : "Other Bags";

        if (allSelected || selectedCategories.includes(bagType)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("lookup-form").addEventListener("submit", function(event) {
        event.preventDefault();
        const customerName = document.getElementById("customer-name").value;
        fetch("/lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer_id: customerName })
        })
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("purchase-history-body");
            tbody.innerHTML = "";

            data.forEach((purchase, index) => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${purchase.style_number}</td>
                    <td>${purchase.name}</td>
                    <td>${purchase.dates}</td>
                    <td>${purchase.total_quantity}</td>
                    <td>${purchase.total_amount}</td>
                    <td><button class="expand-btn" data-index="${index}">Expand</button></td>
                `;
                tbody.appendChild(row);
            });

            document.querySelectorAll(".expand-btn").forEach(button => {
                button.addEventListener("click", function() {
                    const index = this.dataset.index;
                    fetch(`/expanded_lookup?style_number=${data[index].style_number}`)
                        .then(response => response.json())
                        .then(details => {
                            const expandedBody = document.getElementById("expanded-history-body");
                            expandedBody.innerHTML = "";
                            details.forEach(detail => {
                                let detailRow = document.createElement("tr");
                                detailRow.innerHTML = `
                                    <td>${detail.product_id}</td>
                                    <td>${detail.date}</td>
                                    <td>${detail.store}</td>
                                    <td>${detail.quantity}</td>
                                    <td>${detail.amount}</td>
                                    <td>${detail.payment_method}</td>
                                `;
                                expandedBody.appendChild(detailRow);
                            });
                            document.getElementById("expanded-details").style.display = "block";
                        });
                });
            });
        });
    });
});

  document.addEventListener("DOMContentLoaded", function () {
      // Ensure main table is sorted by most recent purchase date on page load
      sortTable(2, 'date', true);
  });
  
  // Sorting function with ascending/descending toggle
  let sortDirections = {}; // Tracks sorting direction for each column
  
  function parseDate(dateString) {
      // Handle MM/DD/YYYY format and YYYY-MM-DD format
      if (dateString.includes('/')) { 
          let parts = dateString.split('/');
          return new Date(parts[2], parts[0] - 1, parts[1]);  // MM/DD/YYYY -> YYYY, MM, DD
      } 
      if (dateString.includes('-')) {  
          let parts = dateString.split('-');
          return new Date(parts[0], parts[1] - 1, parts[2]);  // YYYY-MM-DD -> YYYY, MM, DD
      }
      return new Date(dateString);
  }
  
  
  function sortTable(columnIndex, type = 'string', defaultSort = false) {
      let table = document.getElementById("purchaseHistoryTable");
      if (!table) return; // Ensure table exists
  
      let tbody = table.querySelector("tbody");
      let rows = Array.from(tbody.rows);
  
      // Initialize sorting direction
      if (defaultSort || !sortDirections[columnIndex]) {
          sortDirections[columnIndex] = "desc"; // Default to most recent first
      } else {
          sortDirections[columnIndex] = sortDirections[columnIndex] === "asc" ? "desc" : "asc";
      }
  
      let direction = sortDirections[columnIndex] === "asc" ? 1 : -1;
  
      rows.sort((rowA, rowB) => {
          let cellA = rowA.cells[columnIndex]?.textContent.trim() || "";
          let cellB = rowB.cells[columnIndex]?.textContent.trim() || "";
  
          if (type === 'date') {
              let dateA = parseDate(cellA);
              let dateB = parseDate(cellB);
              return direction * (dateB - dateA); // Ensures most recent appears first
          } else {
              return direction * cellA.localeCompare(cellB, undefined, { numeric: true });
          }
      });
  
      tbody.innerHTML = "";
      rows.forEach(row => tbody.appendChild(row));
  }
  
  // Ensure sorting applies on page load
  document.addEventListener("DOMContentLoaded", function () {
      setTimeout(() => sortTable(2, 'date', true), 500);
  });
  
  
  // Function to populate purchase history correctly
  function populatePurchaseHistory(purchaseHistory) {
    const tableBody = document.getElementById('purchase-history-body');
    tableBody.innerHTML = ''; // Clear previous content

    if (!purchaseHistory || purchaseHistory.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No purchase history found</td></tr>';
        return;
    }

    purchaseHistory.forEach((purchase, index) => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td class="product-number">${purchase.style_number}</td>
            <td class="product-name">${purchase.product_name}</td>
            <td>${purchase.purchases.length > 1 
    ? `<button class="expand-btn" onclick="toggleDetails(${index}, this)">Expand <span class="triangle">▼</span></button>` 
    : purchase.purchases[0]?.purchase_date || 'N/A'}
</td>
            <td>${purchase.total_quantity}</td>
            <td>${purchase.total_amount}</td>
        `;
        tableBody.appendChild(row);

        /* ✅ Compact Sub-Table (Expand Section) */
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

  
  
  async function fetchAutocomplete(query) {
      try {
          let response = await fetch(`http://127.0.0.1:5000/autocomplete?query=${query}`);
          if (!response.ok) throw new Error("Request failed");
          
          let data = await response.json();
          console.log("Autocomplete results:", data);
          return data;
      } catch (error) {
          console.error("Error fetching autocomplete:", error);
          return [];
      }
  }
  document.addEventListener("DOMContentLoaded", function () {
      const searchInput = document.getElementById("customer-name");
      const suggestionsBox = document.getElementById("suggestions-box");
  
      let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  
      function saveToHistory(query) {
          if (!searchHistory.includes(query)) {
              if (searchHistory.length >= 5) {
                  searchHistory.shift(); // Keep only the last 5 searches
              }
              searchHistory.push(query);
              localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
          }
      }
  
      function showSearchHistory() {
          const searchInput = document.getElementById("customer-name");
          let recentBox = document.getElementById("recent-searches-box");
      
          if (!recentBox) {
              recentBox = document.createElement("div");
              recentBox.setAttribute("id", "recent-searches-box");
              searchInput.parentNode.appendChild(recentBox);
          }
      
          recentBox.innerHTML = "";
          if (searchHistory.length > 0) {
              searchHistory.forEach(query => {
                  const historyItem = document.createElement("div");
                  historyItem.classList.add("recent-search-item");
                  historyItem.innerHTML = `<strong>${query}</strong>`;
                  
                  historyItem.addEventListener("click", function () {
                      searchInput.value = query;
                      recentBox.style.display = "none";
                      searchInput.dispatchEvent(new Event("input")); // Trigger search
                  });
      
                  recentBox.appendChild(historyItem);
              });
      
              positionRecentSearchBox(); // Position correctly
              recentBox.style.display = "block";
          }
      }
      
      function positionRecentSearchBox() {
          const searchInput = document.getElementById("customer-name");
          const recentBox = document.getElementById("recent-searches-box");
      
          if (!recentBox) return;
      
          const parentRect = searchInput.parentElement.getBoundingClientRect();
          const inputRect = searchInput.getBoundingClientRect();
      
          recentBox.style.width = `${inputRect.width}px`; // Match input width
          recentBox.style.left = `${inputRect.left - parentRect.left}px`; // Align within parent container
          recentBox.style.top = `${searchInput.offsetHeight + 5}px`; // Position slightly below input
      }
      
  
      searchInput.addEventListener("focus", function () {
          if (searchInput.value.trim() === "") {
              showSearchHistory();
          }
      });
  
      searchInput.addEventListener("input", async function () {
          const query = this.value.trim().toLowerCase();
          if (query.length < 2) {
              suggestionsBox.style.display = "none";
              return;
          }
  
          try {
              const response = await fetch(`/autocomplete?query=${query}`);
              if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
              const data = await response.json();
  
              suggestionsBox.innerHTML = "";
              if (data.length > 0) {
                  suggestionsBox.style.display = "block";
                  positionSuggestionsBox();// Adjust based on input height
              } else {
                  suggestionsBox.style.display = "none";
              }
  
              data.forEach(customer => {
                  const suggestion = document.createElement("div");
                  suggestion.classList.add("suggestion-item");
                  suggestion.innerHTML = `<strong>${customer.first_name} ${customer.last_name}</strong> <span>(${customer.customer_id})</span>`;
                  
                  suggestion.addEventListener("click", function () {
                      searchInput.value = `${customer.first_name} ${customer.last_name}`;
                      saveToHistory(searchInput.value);
                      suggestionsBox.style.display = "none";
                  });
  
                  suggestionsBox.appendChild(suggestion);
              });
  
          } catch (error) {
              console.error("Error fetching autocomplete suggestions:", error);
          }
      });
  
      document.addEventListener("click", function (event) {
          if (!searchInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
              suggestionsBox.style.display = "none";
          }
      });
  });
  
  function positionSuggestionsBox() {
      const searchInput = document.getElementById("customer-name");
      const suggestionsBox = document.getElementById("suggestions-box");
  
      if (!suggestionsBox) return;
  
      const parentRect = searchInput.parentElement.getBoundingClientRect();
      const inputRect = searchInput.getBoundingClientRect();
  
      suggestionsBox.style.width = `${inputRect.width}px`; // Match input width
      suggestionsBox.style.left = `${inputRect.left - parentRect.left}px`; // Align within parent container
      suggestionsBox.style.top = `${searchInput.offsetHeight + 5}px`; // Position slightly below input
  }
  
  function showSearchHistory() {
      const searchInput = document.getElementById("customer-name");
      let recentBox = document.getElementById("recent-searches-box");
  
      if (!recentBox) {
          recentBox = document.createElement("div");
          recentBox.setAttribute("id", "recent-searches-box");
          searchInput.parentNode.appendChild(recentBox);
      }
  
      recentBox.innerHTML = "";
      if (searchHistory.length > 0) {
          searchHistory.forEach(query => {
              const historyItem = document.createElement("div");
              historyItem.classList.add("recent-search-item");
              historyItem.innerHTML = `<strong>${query}</strong>`;
  
              historyItem.addEventListener("click", function () {
                  searchInput.value = query;
                  recentBox.style.display = "none";
                  searchInput.dispatchEvent(new Event("input")); // Trigger search
              });
  
              recentBox.appendChild(historyItem);
          });
  
          positionRecentSearchBox(); // Position correctly
          recentBox.style.display = "block";
      }
  }
  
  document.getElementById("customer-name").addEventListener("input", function () {
      const recentBox = document.getElementById("recent-searches-box");
      if (recentBox) {
          recentBox.style.display = "none"; // Hide recent searches when typing
      }
  });
  
  document.addEventListener("DOMContentLoaded", function () {
      const filterOptions = document.querySelectorAll('input[name="filter"]');
      const tableRows = document.querySelectorAll("#purchase-history tbody tr");
  
      filterOptions.forEach(option => {
          option.addEventListener("change", function () {
              const selectedFilter = this.value;
  
              tableRows.forEach(row => {
                  if (selectedFilter === "All" || row.dataset.category === selectedFilter) {
                      row.style.display = "";
                  } else {
                      row.style.display = "none";
                  }
              });
          });
      });
  });
  
  function filterProducts() {
    let selectedCategories = new Set();
    let checkboxes = document.querySelectorAll("input[name='bag-filter']:checked");

    checkboxes.forEach(checkbox => {
        selectedCategories.add(checkbox.value);
    });

    let rows = document.querySelectorAll("#purchase-history-body tr");

    rows.forEach(row => {
        let styleNumberCell = row.querySelector("td:first-child");
        if (!styleNumberCell) return;

        let styleNumber = styleNumberCell.textContent.trim();
        let productMatch = window.allProducts.find(p => p["style-number"].toString() === styleNumber);
        let bagType = productMatch ? (productMatch["bag-type"] || "Other Bags").replace("|", "").trim() : "Other Bags";

        if (selectedCategories.has("All") || selectedCategories.has(bagType)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });

    // ✅ Ensure sorting is applied after filtering
    sortTable(2, 'date', true);
}


  function handleSelectAll(isChecked) {
      let checkboxes = document.querySelectorAll("input[name='bag-filter']");
      checkboxes.forEach(checkbox => {
          checkbox.checked = isChecked;
      });
  
      filterProducts();  // Apply the filter
  }

  function updateFilterOptions(bagTypes) {
    const filterContainer = document.getElementById("filter-options");
    filterContainer.innerHTML = ""; // ✅ Clear existing filters

    // ✅ Always add "All" checkbox first
    let allLabel = document.createElement("label");
    allLabel.style.display = "block";
    let allCheckbox = document.createElement("input");
    allCheckbox.type = "checkbox";
    allCheckbox.value = "All";
    allCheckbox.checked = true;  
    allCheckbox.addEventListener("change", function () {
        if (this.checked) {
            checkboxes.forEach(checkbox => checkbox.checked = false);
            allCheckbox.checked = true;
        }
        filterProducts();
    });
    allLabel.appendChild(allCheckbox);
    allLabel.append(" All");
    filterContainer.appendChild(allLabel);

    let checkboxes = [];

    let sortedBagTypes = Array.from(bagTypes)
        .map(type => type.replace("|", "").trim())
        .filter(c => c !== "Other Bags").sort();
    sortedBagTypes.push("Other Bags"); // ✅ Ensure "Other Bags" stays at the bottom

    sortedBagTypes.forEach(category => {
        let label = document.createElement("label");
        label.style.display = "block";

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "bag-filter";
        checkbox.value = category;
        checkbox.checked = (category === "All" || category === "Other Bags"); // ✅ Default check

        // ✅ Attach event listener to immediately update filter when clicked
        checkbox.addEventListener("change", function () {
            handleCategorySelection();
        });

        label.appendChild(checkbox);
        label.append(` ${category}`);
        filterContainer.appendChild(label);
        checkboxes.push(checkbox);
    });
}
