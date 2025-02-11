document.getElementById('lookup-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const formData = new FormData(this);

  fetch('/lookup', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    const resultDiv = document.getElementById('result');
    if (data.result.length > 0) {
      let table = `
        <table border="1" cellspacing="0" cellpadding="5">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Bags</th>
            </tr>
          </thead>
          <tbody>
      `;
      data.result.forEach(customer => {
        table += `
          <tr>
            <td>${customer.id || "N/A"}</td>
            <td>${customer.name}</td>
            <td>${customer.bags.join(', ')}</td>
          </tr>
        `;
      });
      table += `</tbody></table>`;
      resultDiv.innerHTML = table;
    } else {
      resultDiv.innerHTML = '<p>No customer found.</p>';
    }
  });
});

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
  } else {
    fetch('/recent')
      .then(response => response.json())
      .then(data => {
        const suggestionBox = document.getElementById('suggestions');
        suggestionBox.innerHTML = '';
        data.recent.forEach(name => {
          suggestionBox.innerHTML += `<option value="${name}">`;
        });
      });
  }
});
