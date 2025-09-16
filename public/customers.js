document.addEventListener('DOMContentLoaded', async () => {
const tableBody = document.getElementById('customers-table-body');
const searchInput = document.getElementById('search-input');
    const startDateFilter = document.getElementById('start-date-filter');
    const endDateFilter = document.getElementById('end-date-filter');
const franchiseFilter = document.getElementById('franchise-filter');
const closerFilter = document.getElementById('closer-filter');
const monthFilter = document.getElementById('month-filter');
const yearFilter = document.getElementById('year-filter');
const reminderFilter = document.getElementById('reminder-filter');
    const totalAppointmentsCount = document.getElementById('totalAppointmentsCount');
    const totalPetsCount = document.getElementById('totalPetsCount');

let allCustomersData = [];

// Helper function to format a date string
function formatDate(dateStr) {
if (!dateStr) return '';
        // Assuming dateStr is in YYYY/MM/DD format
const parts = dateStr.split('/');
return `${parts[1]}/${parts[2]}/${parts[0]}`;
}
@@ -24,10 +27,21 @@ document.addEventListener('DOMContentLoaded', async () => {
tableBody.innerHTML = ''; // Clear the table
if (data.length === 0) {
tableBody.innerHTML = '<tr><td colspan="13" class="p-4 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>';
            totalAppointmentsCount.textContent = 0;
            totalPetsCount.textContent = 0;
return;
}
        

const today = new Date();
        const totalAppointments = data.length;
        const totalPets = data.reduce((sum, customer) => {
            const pets = parseInt(customer.pets, 10);
            return sum + (isNaN(pets) ? 0 : pets);
        }, 0);

        totalAppointmentsCount.textContent = totalAppointments;
        totalPetsCount.textContent = totalPets;
        
data.forEach(customer => {
const row = document.createElement('tr');
row.classList.add('border-b', 'border-border', 'hover:bg-muted/50', 'transition-colors');
@@ -38,7 +52,7 @@ document.addEventListener('DOMContentLoaded', async () => {

if (reminderDate < today) {
reminderDisplay = `<span class="text-green-600 font-medium">Enviar Reminder</span>`;
                reminderClasses = 'p-4'; // No special class for now, color is set directly in span
                reminderClasses = 'p-4'; 
}

row.innerHTML = `
@@ -63,13 +77,20 @@ document.addEventListener('DOMContentLoaded', async () => {
// Function to apply all filters
function applyFilters() {
const searchTerm = searchInput.value.toLowerCase();
        const selectedStartDate = startDateFilter.value ? new Date(startDateFilter.value) : null;
        const selectedEndDate = endDateFilter.value ? new Date(endDateFilter.value) : null;
const selectedFranchise = franchiseFilter.value.toLowerCase();
const selectedCloser = closerFilter.value.toLowerCase();
const selectedMonth = monthFilter.value;
const selectedYear = yearFilter.value;
const selectedReminder = reminderFilter.value;

const filteredData = allCustomersData.filter(customer => {
            const customerDate = new Date(customer.date.split('/').reverse().join('-'));

            const matchesDateRange = (!selectedStartDate || customerDate >= selectedStartDate) &&
                                     (!selectedEndDate || customerDate <= selectedEndDate);
            
const matchesSearch = searchTerm === '' || 
(customer.customers && customer.customers.toLowerCase().includes(searchTerm)) ||
(customer.phone && customer.phone.toLowerCase().includes(searchTerm)) ||
@@ -92,7 +113,7 @@ document.addEventListener('DOMContentLoaded', async () => {
const reminderDate = new Date(customer.reminderDate);
const matchesReminder = selectedReminder === '' || (selectedReminder === 'send-reminder' && reminderDate < today);

            return matchesSearch && matchesFranchise && matchesCloser && matchesMonth && matchesYear && matchesReminder;
            return matchesSearch && matchesFranchise && matchesCloser && matchesMonth && matchesYear && matchesReminder && matchesDateRange;
});

renderTable(filteredData);
@@ -162,6 +183,8 @@ document.addEventListener('DOMContentLoaded', async () => {

// Add event listeners for filters
searchInput.addEventListener('input', applyFilters);
    startDateFilter.addEventListener('change', applyFilters);
    endDateFilter.addEventListener('change', applyFilters);
franchiseFilter.addEventListener('change', applyFilters);
closerFilter.addEventListener('change', applyFilters);
monthFilter.addEventListener('change', applyFilters);
