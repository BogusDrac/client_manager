document.getElementById('client-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const streetName = document.getElementById('streetName').value;
    const houseNumber = document.getElementById('houseNumber').value;
    const toiletNumber = document.getElementById('toiletNumber').value || 'N/A';
    const deliveryDate = document.getElementById('deliveryDate').value;
    const dueDate = document.getElementById('dueDate').value;
    const amountDue = document.getElementById('amountDue').value;

    const address = `${houseNumber} ${streetName}, Toilet: ${toiletNumber}`;

    const table = document.getElementById('client-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    newRow.innerHTML = `
        <td>${name}</td>
        <td>${address}</td>
        <td>${deliveryDate}</td>
        <td>${dueDate}</td>
        <td>${amountDue}</td>
        <td>
            <button class="details-btn btn btn-info btn-sm">Details</button>
            <button class="edit-btn btn btn-warning btn-sm">Edit</button>
            <button class="delete-btn btn btn-danger btn-sm">Delete</button>
        </td>
    `;

    newRow.querySelector('.delete-btn').addEventListener('click', function() {
        table.deleteRow(newRow.rowIndex - 1);
    });

    newRow.querySelector('.edit-btn').addEventListener('click', function() {
        editClient(newRow);
    });

    newRow.querySelector('.details-btn').addEventListener('click', function() {
        viewClientDetails(newRow);
    });

    document.getElementById('client-form').reset();
    addNotification(name, dueDate);
});

function editClient(row) {
    const cells = row.getElementsByTagName('td');
    document.getElementById('name').value = cells[0].innerText;
    const addressParts = cells[1].innerText.split(', Toilet: ');
    const streetAndHouse = addressParts[0].split(' ');
    document.getElementById('houseNumber').value = streetAndHouse[0];
    document.getElementById('streetName').value = streetAndHouse.slice(1).join(' ');
    document.getElementById('toiletNumber').value = addressParts[1] !== 'N/A' ? addressParts[1] : '';
    document.getElementById('deliveryDate').value = cells[2].innerText;
    document.getElementById('dueDate').value = cells[3].innerText;
    document.getElementById('amountDue').value = cells[4].innerText;

    // Remove the row being edited
    row.remove();
}

function viewClientDetails(row) {
    const cells = row.getElementsByTagName('td');
    const clientDetails = `
        <p><strong>Client Name:</strong> ${cells[0].innerText}</p>
        <p><strong>Address:</strong> ${cells[1].innerText}</p>
        <p><strong>Delivery Date:</strong> ${cells[2].innerText}</p>
        <p><strong>Payment Due Date:</strong> ${cells[3].innerText}</p>
        <p><strong>Amount Due:</strong> ${cells[4].innerText}</p>
    `;
    document.getElementById('client-details').innerHTML = clientDetails;
    new bootstrap.Modal(document.getElementById('clientModal')).show();
}

document.getElementById('save-pdf').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let rows = [];
    document.querySelectorAll('#client-table tbody tr').forEach(tr => {
        let row = [];
        tr.querySelectorAll('td').forEach((td, index) => {
            if (index < 5) {
                row.push(td.innerText);
            }
        });
        rows.push(row);
    });

    doc.autoTable({
        head: [['Client Name', 'Address', 'Delivery Date', 'Payment Due Date', 'Amount Due']],
        body: rows,
    });

    doc.save('client-list.pdf');
});

document.getElementById('save-txt').addEventListener('click', function() {
    let text = 'Client Name, Address, Delivery Date, Payment Due Date, Amount Due\n';
    document.querySelectorAll('#client-table tbody tr').forEach(tr => {
        let row = '';
        tr.querySelectorAll('td').forEach((td, index) => {
            if (index < 5) {
                row += `${td.innerText}, `;
            }
        });
        text += row.slice(0, -2) + '\n'; // Remove trailing comma and space
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'client-list.txt';
    link.click();
});

document.getElementById('search').addEventListener('input', function() {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('#client-table tbody tr');

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        const name = cells[0].innerText.toLowerCase();
        const address = cells[1].innerText.toLowerCase();
        if (name.includes(filter) || address.includes(filter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

function sortTable(columnIndex) {
    const table = document.getElementById('client-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.rows);
    const isAscending = table.querySelector(`th:nth-child(${columnIndex + 1})`).classList.toggle('asc');

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].innerText;
        const cellB = rowB.cells[columnIndex].innerText;

        if (columnIndex === 2 || columnIndex === 3) { // Date columns
            return isAscending ? new Date(cellA) - new Date(cellB) : new Date(cellB) - new Date(cellA);
        } else if (columnIndex === 4) { // Numeric columns
            return isAscending ? parseFloat(cellA) - parseFloat(cellB) : parseFloat(cellB) - parseFloat(cellA);
        } else {
            return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
    });

    rows.forEach(row => tbody.appendChild(row));
}

document.getElementById('theme-switcher').addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    this.textContent = document.body.classList.contains('dark-theme') ? 'Switch to Light Theme' : 'Switch to Dark Theme';
});

function addNotification(clientName, dueDate) {
    const currentDate = new Date();
    const dueDateObj = new Date(dueDate);
    const daysLeft = Math.ceil((dueDateObj - currentDate) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 7 && daysLeft > 0) {
        const notification = document.createElement('div');
        notification.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
        notification.innerHTML = `
            <strong>Reminder:</strong> Payment due for ${clientName} in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.querySelector('.container').prepend(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

document.getElementById('monthly-report').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let rows = [];
    document.querySelectorAll('#client-table tbody tr').forEach(tr => {
        const cells = tr.querySelectorAll('td');
        const deliveryDate = new Date(cells[2].innerText);

        if (deliveryDate.getMonth() === currentMonth && deliveryDate.getFullYear() === currentYear) {
            let row = [];
            cells.forEach((td, index) => {
                if (index < 5) {
                    row.push(td.innerText);
                }
            });
            rows.push(row);
        }
    });

    doc.text(`Monthly Report for ${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`, 14, 15);
    doc.autoTable({
        startY: 20,
        head: [['Client Name', 'Address', 'Delivery Date', 'Payment Due Date', 'Amount Due']],
        body: rows,
    });

    doc.save('monthly-report.pdf');
});