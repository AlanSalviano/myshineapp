// public/analytics.js

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('analytics-table-body');
    const tableFooter = document.getElementById('analytics-table-footer');
    const monthFilter = document.getElementById('month-filter');
    const yearFilter = document.getElementById('year-filter');
    const goalInput = document.getElementById('goal-input');
    const goalProgress = document.getElementById('goal-progress');
    const goalPercentage = document.getElementById('goal-percentage');
    const closerInsightsContainer = document.getElementById('closer-insights-container');

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
        tableBody.innerHTML = '';
        
        const filteredEmployees = employees.filter(e => {
            return data.some(app => app.closer1 === e || app.closer2 === e);
        });

        if (filteredEmployees.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="15" class="p-4 text-center text-muted-foreground">Nenhum closer encontrado com agendamentos.</td></tr>';
            return;
        }

        const closerTotals = {};

        filteredEmployees.forEach(closer => {
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

        const sortedEmployees = [...filteredEmployees].sort();
        let totalCloserAppointments = 0;

        sortedEmployees.forEach(closer => {
            totalCloserAppointments += closerTotals[closer].totalCloser;
        });

        sortedEmployees.forEach(closer => {
            const totals = closerTotals[closer];
            const percentage = totalCloserAppointments > 0 ? (totals.totalCloser / totalCloserAppointments) * 100 : 0;
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-border', 'hover:bg-muted/50', 'transition-colors');
            
            row.innerHTML = `
                <td class="p-4 font-semibold cursor-pointer" data-closer-name="${closer}">${closer}</td>
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
    
    // Function to render the advanced dashboard cards
    function renderAdvancedDashboard(data) {
        const totalCloserAppointments = data.reduce((sum, closer) => sum + closer.totalCloser, 0);
        
        let htmlContent = '';
        const sortedData = data.filter(c => c.totalCloser > 0 || c.totalInTeam > 0).sort((a, b) => b.totalCloser - a.totalCloser);

        sortedData.forEach(closerStats => {
            const percentage = totalCloserAppointments > 0 ? (closerStats.totalCloser / totalCloserAppointments) * 100 : 0;
            htmlContent += `
                <div class="p-4 border-b border-border last:border-b-0">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-semibold">${closerStats.closer}</h3>
                        <p class="text-xs font-medium text-brand-primary">${percentage.toFixed(2)}%</p>
                    </div>
                    <div class="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>Closer: ${closerStats.totalCloser}</span>
                        <span>In Team: ${closerStats.totalInTeam}</span>
                    </div>
                </div>
            `;
        });
        
        if (sortedData.length > 0) {
            closerInsightsContainer.innerHTML = htmlContent;
        } else {
            closerInsightsContainer.innerHTML = '<p class="text-sm text-muted-foreground p-4">Nenhum closer com agendamentos no período selecionado.</p>';
        }
    }

    function showFranchisePopup(closerName) {
        const closerAppointments = allAppointmentsData.filter(app => app.closer1 === closerName);
        const franchiseCounts = closerAppointments.reduce((acc, app) => {
            const franchise = app.franchise || 'Unknown';
            acc[franchise] = (acc[franchise] || 0) + 1;
            return acc;
        }, {});
    
        let popupContent = `<h3 class="text-lg font-bold mb-4">Agendamentos de ${closerName} por Franquia</h3>`;
        if (Object.keys(franchiseCounts).length > 0) {
            popupContent += '<ul class="list-disc pl-5 space-y-1">';
            for (const franchise in franchiseCounts) {
                popupContent += `<li>${franchise}: ${franchiseCounts[franchise]} agendamento(s)</li>`;
            }
            popupContent += '</ul>';
        } else {
            popupContent += '<p>Nenhum agendamento encontrado para este closer.</p>';
        }
    
        const popup = document.createElement('div');
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        popup.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
                <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onclick="this.parentNode.parentNode.remove()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
                ${popupContent}
            </div>
        `;
        document.body.appendChild(popup);
    }
    
    document.addEventListener('click', (event) => {
        const closerNameCell = event.target.closest('td[data-closer-name]');
        if (closerNameCell) {
            const closerName = closerNameCell.dataset.closerName;
            showFranchisePopup(closerName);
        }
    });

    // Function to apply all filters and render all sections
    function applyFilters() {
        const selectedMonth = monthFilter.value;
        const selectedYear = yearFilter.value;

        const filteredData = allAppointmentsData.filter(appointment => {
            const matchesMonth = selectedMonth === '' || (appointment.month && appointment.month.toString() === selectedMonth);
            const matchesYear = selectedYear === '' || (appointment.year && appointment.year.toString() === selectedYear);
            return matchesMonth && matchesYear;
        });

        // Calculate data for the tables and advanced dashboard
        const closerPerformanceData = {};
        allEmployees.forEach(closer => {
            closerPerformanceData[closer] = { totalCloser: 0, totalInTeam: 0 };
        });

        filteredData.forEach(appointment => {
            if (appointment.closer1 && closerPerformanceData[appointment.closer1]) {
                closerPerformanceData[appointment.closer1].totalCloser++;
            }
            if (appointment.closer2 && closerPerformanceData[appointment.closer2]) {
                closerPerformanceData[appointment.closer2].totalInTeam++;
            }
        });

        const performanceData = Object.keys(closerPerformanceData).map(closer => ({
            closer,
            totalCloser: closerPerformanceData[closer].totalCloser,
            totalInTeam: closerPerformanceData[closer].totalInTeam
        }));
        
        renderTable(filteredData, allEmployees);
        renderAdvancedDashboard(performanceData);
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
            const [appointmentsResponse, employeesResponse] = await Promise.all([
                fetch('/api/get-customers-data'),
                fetch('/api/get-dashboard-data')
            ]);

            if (!appointmentsResponse.ok || !employeesResponse.ok) {
                throw new Error('Failed to load data from one or more APIs.');
            }

            const appointmentsData = await appointmentsResponse.json();
            const employeesData = await employeesResponse.json();

            allAppointmentsData = appointmentsData.customers;
            allEmployees = employeesData.employees;

            populateYearFilter();

            applyFilters();
            
        } catch (error) {
            console.error('Error fetching data:', error);
            const errorMessage = 'Erro ao carregar dados. Tente novamente.';
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="15" class="p-4 text-center text-red-600">${errorMessage}</td></tr>`;
            if(closerInsightsContainer) closerInsightsContainer.innerHTML = `<p class="text-sm text-red-600 p-4">${errorMessage}</p>`;
        }
    }

    // Add event listeners for filters
    monthFilter.addEventListener('change', applyFilters);
    yearFilter.addEventListener('change', applyFilters);
    goalInput.addEventListener('input', applyFilters);

    initDashboard();
});
