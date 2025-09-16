// public/analytics.js

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('analytics-table-body');
    const tableFooter = document.getElementById('analytics-table-footer');
    const monthFilter = document.getElementById('month-filter');
    const yearFilter = document.getElementById('year-filter');
    const goalInput = document.getElementById('goal-input');
    const goalProgress = document.getElementById('goal-progress');
    const goalPercentage = document.getElementById('goal-percentage');

    let allAppointmentsData = [];
    let allEmployees = [];

    // Function to update the goal progress bar
    function updateGoalProgress(closerTotal, goal) {
        let percentage = 0;
        if (goal > 0) {
            percentage = Math.min(100, (closerTotal / goal) * 100);
        }
        
        goalProgress.style.width = `${percentage}%`;
        goalPercentage.textContent = `${Math.round(percentage)}%`;

        if (percentage >= 100) {
            goalProgress.classList.remove('bg-brand-primary');
            goalProgress.classList.add('bg-green-600');
        } else {
            goalProgress.classList.remove('bg-green-600');
            goalProgress.classList.add('bg-brand-primary');
        }
    }

    // Function to render the table with the calculated data
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
                totalCloser: 0,
                totalInTeam: 0,
                grandTotal: 0
            };
        });

        data.forEach(appointment => {
            const week = parseInt(appointment.week, 10);
            if (week >= 1 && week <= 5) {
                if (appointment.closer1 && closerTotals[appointment.closer1]) {
                    closerTotals[appointment.closer1].closer1[week - 1]++;
                    closerTotals[appointment.closer1].totalCloser++;
                    closerTotals[appointment.closer1].grandTotal++;
                }
                if (appointment.closer2 && closerTotals[appointment.closer2]) {
                    closerTotals[appointment.closer2].closer2[week - 1]++;
                    closerTotals[appointment.closer2].totalInTeam++;
                    closerTotals[appointment.closer2].grandTotal++;
                }
            }
        });

        const sortedEmployees = [...employees].sort();
        let totalCloserAppointments = 0;

        // First pass to calculate total closer appointments for percentage calculation
        sortedEmployees.forEach(closer => {
            totalCloserAppointments += closerTotals[closer].totalCloser;
        });

        // Second pass to render table rows
        sortedEmployees.forEach(closer => {
            const totals = closerTotals[closer];
            const percentage = totalCloserAppointments > 0 ? (totals.totalCloser / totalCloserAppointments) * 100 : 0;
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
                <td class="p-4 text-center font-bold">${totals.totalCloser}</td>
                <td class="p-4 text-center font-bold">${totals.totalInTeam}</td>
                <td class="p-4 text-center font-bold">${totals.grandTotal}</td>
                <td class="p-4 text-center font-bold">${percentage.toFixed(2)}%</td>
            `;
            tableBody.appendChild(row);
        });

        // Render the total row at the bottom
        const totalCloser = sortedEmployees.reduce((sum, closer) => sum + closerTotals[closer].totalCloser, 0);
        
        tableFooter.innerHTML = `
            <tr>
                <td class="p-4 font-bold">Grand Total</td>
                <td colspan="10" class="p-4"></td>
                <td class="p-4 text-center font-bold">${totalCloser}</td>
                <td class="p-4 text-center"></td>
                <td class="p-4 text-center"></td>
                <td class="p-4 text-center"></td>
            </tr>
        `;
        
        updateGoalProgress(totalCloserAppointments, parseInt(goalInput.value, 10));
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
    goalInput.addEventListener('input', () => {
        applyFilters();
    });

    initDashboard();
});
