// public/analytics.js

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('analytics-table-body');
    const monthFilter = document.getElementById('month-filter');
    const yearFilter = document.getElementById('year-filter');

    let allAppointmentsData = [];
    let allEmployees = [];

    // Helper function to render the table with the calculated data
    function renderTable(data, employees) {
        tableBody.innerHTML = ''; // Clear table content
        
        if (employees.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="14" class="p-4 text-center text-muted-foreground">Nenhum closer encontrado.</td></tr>';
            return;
        }

        const closerTotals = {};

        employees.forEach(closer => {
            closerTotals[closer] = {
                closer1: Array(5).fill(0),
                closer2: Array(5).fill(0),
                total1: 0,
                total2: 0,
                grandTotal: 0
            };
        });

        data.forEach(appointment => {
            const week = parseInt(appointment.week, 10);
            if (week >= 1 && week <= 5) {
                if (appointment.closer1 && closerTotals[appointment.closer1]) {
                    closerTotals[appointment.closer1].closer1[week - 1]++;
                    closerTotals[appointment.closer1].total1++;
                    closerTotals[appointment.closer1].grandTotal++;
                }
                if (appointment.closer2 && closerTotals[appointment.closer2]) {
                    closerTotals[appointment.closer2].closer2[week - 1]++;
                    closerTotals[appointment.closer2].total2++;
                    closerTotals[appointment.closer2].grandTotal++;
                }
            }
        });

        // Sort employees alphabetically
        const sortedEmployees = [...employees].sort();

        sortedEmployees.forEach(closer => {
            const totals = closerTotals[closer];
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-border', 'hover:bg-muted/50', 'transition-colors');
            
            row.innerHTML = `
                <td class="p-4 font-semibold">${closer}</td>
                <td class="p-4 text-center">${totals.closer1[0]}</td>
                <td class="p-4 text-center">${totals.closer2[0]}</td>
                <td class="p-4 text-center">${totals.closer1[1]}</td>
                <td class="p-4 text-center">${totals.closer2[1]}</td>
                <td class="p-4 text-center">${totals.closer1[2]}</td>
                <td class="p-4 text-center">${totals.closer2[2]}</td>
                <td class="p-4 text-center">${totals.closer1[3]}</td>
                <td class="p-4 text-center">${totals.closer2[3]}</td>
                <td class="p-4 text-center">${totals.closer1[4]}</td>
                <td class="p-4 text-center">${totals.closer2[4]}</td>
                <td class="p-4 text-center font-bold">${totals.total1}</td>
                <td class="p-4 text-center font-bold">${totals.total2}</td>
                <td class="p-4 text-center font-bold">${totals.grandTotal}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Function to apply filters and render the table
    function applyFilters() {
        const selectedMonth = monthFilter.value;
        const selectedYear = yearFilter.value;

        const filteredData = allAppointmentsData.filter(appointment => {
            const matchesMonth = selectedMonth === '' || (appointment.month && appointment.month.toString() === selectedMonth);
            const matchesYear = selectedYear === '' || (appointment.year && appointment.year.toString() === selectedYear);
            return matchesMonth && matchesYear;
        });
        
        renderTable(filteredData, allEmployees);
    }

    // Function to populate filter dropdowns with years
    function populateYearFilter() {
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 1, currentYear, currentYear + 1];
        yearFilter.innerHTML = `<option value="">Select Year</option>`;
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
        yearFilter.value = currentYear;
    }

    // Main function to fetch data and initialize the dashboard
    async function initDashboard() {
        try {
            // Fetch appointments data
            const appointmentsResponse = await fetch('/api/get-customers-data');
            if (!appointmentsResponse.ok) {
                throw new Error('Failed to load appointments data.');
            }
            const appointmentsData = await appointmentsResponse.json();
            allAppointmentsData = appointmentsData.customers;

            // Fetch all employees (closers)
            const employeesResponse = await fetch('/api/get-dashboard-data');
            if (!employeesResponse.ok) {
                throw new Error('Failed to load employees data.');
            }
            const employeesData = await employeesResponse.json();
            allEmployees = employeesData.employees;

            populateYearFilter();

            applyFilters();
        } catch (error) {
            console.error('Error fetching data:', error);
            tableBody.innerHTML = '<tr><td colspan="14" class="p-4 text-center text-red-600">Erro ao carregar dados. Tente novamente.</td></tr>';
        }
    }

    // Add event listeners for filters
    monthFilter.addEventListener('change', applyFilters);
    yearFilter.addEventListener('change', applyFilters);

    initDashboard();
});
