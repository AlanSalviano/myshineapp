// public/customers.js

// Function to fetch and update all dashboard data
async function fetchAndRenderCustomersData() {
    try {
        const response = await fetch('/api/get-customers-data');
        if (!response.ok) {
            throw new Error('Failed to load customer data.');
        }
        const data = await response.json();
        
        // This is where you would process and display the customer data
        // For now, we'll use placeholder values
        document.getElementById('totalCustomersCount').textContent = '150';
        document.getElementById('customersDifference').textContent = '+10 from last month';
        document.getElementById('newCustomersCount').textContent = '25';
        document.getElementById('newCustomersPercentage').textContent = '+20% this month';
        document.getElementById('totalPetsCount').textContent = '250';
        document.getElementById('petsDifference').textContent = '+15% from last month';
        document.getElementById('mostCommonCity').textContent = 'City Placeholder';

    } catch (error) {
        console.error('Error fetching customer data:', error);
        // Fallback to display errors
        document.getElementById('totalCustomersCount').textContent = 'error';
        document.getElementById('customersDifference').textContent = 'Error loading data';
        document.getElementById('newCustomersCount').textContent = 'error';
        document.getElementById('newCustomersPercentage').textContent = 'Error loading data';
        document.getElementById('totalPetsCount').textContent = 'error';
        document.getElementById('petsDifference').textContent = 'Error loading data';
        document.getElementById('mostCommonCity').textContent = 'error';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    fetchAndRenderCustomersData();
});