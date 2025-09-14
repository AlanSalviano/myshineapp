// public/customers.js

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('customers-table-body');
    const searchInput = document.getElementById('search-input');
    const franchiseFilter = document.getElementById('franchise-filter');
    const closerFilter = document.getElementById('closer-filter');

    let allCustomersData = [];

    // Helper function to format a date string
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('/');
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }

    // Function to render the table rows based on filtered data
    function renderTable(data) {
        tableBody.innerHTML = ''; // Clear the table
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>';
            return;
        }
        
        data.forEach(customer => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-border', 'hover:bg-muted/50', 'transition-colors');
            row.innerHTML = `
                <td class="p-4">${customer.code}</td>
                <td class="p-4">${customer.customers}</td>
                <td class="p-4">${customer.phone}</td>
                <td class="p-4">${customer.city}</td>
                <td class="p-4">${customer.franchise}</td>
                <td class="p-4">${customer.closer1}</td>
                <td class="p-4">${customer.closer2}</td>
                <td class="p-4">${formatDate(customer.appointmentDate)}</td>
                <td class="p-4">${formatDate(customer.reminderDate)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Function to apply all filters
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedFranchise = franchiseFilter.value.toLowerCase();
        const selectedCloser = closerFilter.value.toLowerCase();

        const filteredData = allCustomersData.filter(customer => {
            const matchesSearch = searchTerm === '' || 
                                  (customer.customers && customer.customers.toLowerCase().includes(searchTerm)) ||
                                  (customer.phone && customer.phone.toLowerCase().includes(searchTerm)) ||
                                  (customer.city && customer.city.toLowerCase().includes(searchTerm));
            
            const matchesFranchise = selectedFranchise === '' || 
                                     (customer.franchise && customer.franchise.toLowerCase() === selectedFranchise);
            
            const matchesCloser = selectedCloser === '' || 
                                  (customer.closer1 && customer.closer1.toLowerCase() === selectedCloser) ||
                                  (customer.closer2 && customer.closer2.toLowerCase() === selectedCloser);

            return matchesSearch && matchesFranchise && matchesCloser;
        });

        renderTable(filteredData);
    }
    
    // Function to populate filter dropdowns
    function populateFilters(data) {
        const franchises = new Set();
        const closers = new Set();
        data.forEach(item => {
            if (item.franchise) franchises.add(item.franchise);
            if (item.closer1) closers.add(item.closer1);
            if (item.closer2) closers.add(item.closer2);
        });

        franchises.forEach(franchise => {
            const option = document.createElement('option');
            option.value = franchise;
            option.textContent = franchise;
            franchiseFilter.appendChild(option);
        });
        
        closers.forEach(closer => {
            const option = document.createElement('option');
            option.value = closer;
            option.textContent = closer;
            closerFilter.appendChild(option);
        });
    }

    // Main function to fetch and initialize the dashboard
    async function initDashboard() {
        try {
            const response = await fetch('/api/get-customers-data');
            if (!response.ok) {
                throw new Error('Failed to load customer data.');
            }
            const data = await response.json();
            allCustomersData = data.customers;
            
            renderTable(allCustomersData);
            populateFilters(allCustomersData);

        } catch (error) {
            console.error('Error fetching customer data:', error);
            tableBody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-red-600">Erro ao carregar dados. Tente novamente.</td></tr>';
        }
    }

    // Add event listeners for filters
    searchInput.addEventListener('input', applyFilters);
    franchiseFilter.addEventListener('change', applyFilters);
    closerFilter.addEventListener('change', applyFilters);

    initDashboard();
});
