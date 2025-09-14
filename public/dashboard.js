// public/dashboard.js

// Helper function to format a date object to YYYY/MM/DD string
function formatDateToYYYYMMDD(dateObj) {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// Function to fetch and count today's and yesterday's appointments
async function fetchAndCountAppointments() {
    try {
        const response = await fetch('/api/get-appointments'); 
        
        if (!response.ok) {
            document.getElementById('todayAppointmentsCount').textContent = 'error';
            throw new Error('Erro ao carregar dados da API.');
        }
        const appointments = await response.json();

        // Get today's and yesterday's dates
        const today = formatDateToYYYYMMDD(new Date());
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayFormatted = formatDateToYYYYMMDD(yesterday);
        
        // --- LOG DE DEPURAÇÃO ---
        console.log("-----------------------------------------");
        console.log("Dados recebidos da API:", appointments);
        console.log("Data de hoje para comparação:", today);
        console.log("Data de ontem para comparação:", yesterdayFormatted);
        if (appointments.length > 0) {
            console.log("Data do primeiro agendamento na planilha:", appointments[0].date);
        }
        console.log("-----------------------------------------");
        // --- FIM DO LOG DE DEPURAÇÃO ---

        // Filter appointments for today and yesterday
        const todayAppointments = appointments.filter(appointment => appointment.date === today);
        const yesterdayAppointments = appointments.filter(appointment => appointment.date === yesterdayFormatted);
        
        // Calculate the difference
        const difference = todayAppointments.length - yesterdayAppointments.length;
        
        // Determine the text to display
        let differenceText;
        if (difference > 0) {
            differenceText = `+${difference} from yesterday`;
        } else if (difference < 0) {
            differenceText = `${difference} from yesterday`;
        } else {
            differenceText = `No change from yesterday`;
        }
        
        // Update the counts and difference on the dashboard
        document.getElementById('todayAppointmentsCount').textContent = todayAppointments.length;
        document.getElementById('appointmentDifference').textContent = differenceText;
        console.log(`Appointments today: ${todayAppointments.length}, yesterday: ${yesterdayAppointments.length}. Difference: ${difference}`);

    } catch (error) {
        console.error(error);
        document.getElementById('todayAppointmentsCount').textContent = 'error';
        document.getElementById('appointmentDifference').textContent = 'error';
    }
}

// Function to fetch and count this month's appointments
async function fetchAndCountCustomersThisMonth() {
    try {
        const response = await fetch('/api/get-appointments'); 
        
        if (!response.ok) {
            document.getElementById('customersThisMonthCount').textContent = 'error';
            document.getElementById('customersThisMonthPercentage').textContent = '';
            throw new Error('Erro ao carregar dados da API.');
        }
        const appointments = await response.json();

        // Get current month and year
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // Get previous month and year
        const previousDate = new Date();
        previousDate.setMonth(previousDate.getMonth() - 1);
        const previousMonth = previousDate.getMonth() + 1;
        const previousYear = previousDate.getFullYear();
        
        // Filter appointments for the current month and previous month
        const thisMonthAppointments = appointments.filter(appointment => {
            const parts = appointment.date.split('/');
            const appointmentYear = parseInt(parts[0], 10);
            const appointmentMonth = parseInt(parts[1], 10);
            return appointmentMonth === currentMonth && appointmentYear === currentYear;
        });

        const lastMonthAppointments = appointments.filter(appointment => {
            const parts = appointment.date.split('/');
            const appointmentYear = parseInt(parts[0], 10);
            const appointmentMonth = parseInt(parts[1], 10);
            return appointmentMonth === previousMonth && appointmentYear === previousYear;
        });
        
        // Calculate the percentage difference
        let percentageText;
        if (lastMonthAppointments.length === 0) {
            if (thisMonthAppointments.length > 0) {
                percentageText = "New this month";
            } else {
                percentageText = "No change this month";
            }
        } else {
            const percentageChange = ((thisMonthAppointments.length - lastMonthAppointments.length) / lastMonthAppointments.length) * 100;
            const sign = percentageChange >= 0 ? '+' : '';
            percentageText = `${sign}${Math.round(percentageChange)}% this month`;
        }

        // Update the counts on the dashboard
        document.getElementById('customersThisMonthCount').textContent = thisMonthAppointments.length;
        document.getElementById('customersThisMonthPercentage').textContent = percentageText;

        console.log(`Customers this month: ${thisMonthAppointments.length}, last month: ${lastMonthAppointments.length}. Percentage Change: ${percentageText}`);

    } catch (error) {
        console.error('Error in fetchAndCountCustomersThisMonth:', error);
        document.getElementById('customersThisMonthCount').textContent = 'error';
        document.getElementById('customersThisMonthPercentage').textContent = 'error';
    }
}


// Function to fetch and count pets this month
async function fetchAndCountPetsThisMonth() {
    try {
        const response = await fetch('/api/get-appointments'); 
        
        if (!response.ok) {
            document.getElementById('petsThisMonthCount').textContent = 'error';
            document.getElementById('petsThisMonthPercentage').textContent = '';
            throw new Error('Erro ao carregar dados da API.');
        }
        const appointments = await response.json();
        
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const previousDate = new Date();
        previousDate.setMonth(previousDate.getMonth() - 1);
        const previousMonth = previousDate.getMonth() + 1;
        const previousYear = previousDate.getFullYear();

        let thisMonthPetsCount = 0;
        let lastMonthPetsCount = 0;

        appointments.forEach(appointment => {
            const parts = appointment.date.split('/');
            const appointmentYear = parseInt(parts[0], 10);
            const appointmentMonth = parseInt(parts[1], 10);

            if (appointmentMonth === currentMonth && appointmentYear === currentYear) {
                thisMonthPetsCount += appointment.pets;
            } else if (appointmentMonth === previousMonth && appointmentYear === previousYear) {
                lastMonthPetsCount += appointment.pets;
            }
        });

        // Calculate the percentage difference
        let percentageText;
        if (lastMonthPetsCount === 0) {
            if (thisMonthPetsCount > 0) {
                percentageText = "New this month";
            } else {
                percentageText = "No change this month";
            }
        } else {
            const percentageChange = ((thisMonthPetsCount - lastMonthPetsCount) / lastMonthPetsCount) * 100;
            const sign = percentageChange >= 0 ? '+' : '';
            percentageText = `${sign}${Math.round(percentageChange)}% this month`;
        }
        
        // Update the count and percentage on the dashboard
        document.getElementById('petsThisMonthCount').textContent = thisMonthPetsCount;
        document.getElementById('petsThisMonthPercentage').textContent = percentageText;

        console.log(`Pets this month: ${thisMonthPetsCount}, last month: ${lastMonthPetsCount}. Percentage Change: ${percentageText}`);

    } catch (error) {
        console.error('Error in fetchAndCountPetsThisMonth:', error);
        document.getElementById('petsThisMonthCount').textContent = 'error';
        document.getElementById('petsThisMonthPercentage').textContent = 'error';
    }
}


// Function to handle form submission
async function handleFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    const formattedData = {
        type: data.type,
        data: data.data,
        pets: data.pets,
        closer1: data.closer1,
        closer2: data.closer2,
        customers: data.customers,
        phone: data.phone,
        oldNew: data.oldNew,
        appointmentDate: data.appointmentDate,
        serviceValue: data.serviceValue,
        franchise: data.franchise,
        city: data.city,
        source: data.source,
        week: data.week,
        month: data.month,
        year: data.year,
        value: '', 
        code: document.getElementById('codePass').value,
        reminderDate: document.getElementById('reminderDate').value
    };

    try {
        const response = await fetch('/api/register-appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedData),
        });
        
        const result = await response.json();

        if (result.success) {
            form.reset();
            fetchAndCountAppointments(); // Update count after a successful registration
            fetchAndCountCustomersThisMonth(); // Update count after a successful registration
            fetchAndCountPetsThisMonth(); // Update pets count after a successful registration
        }
    } catch (error) {
        console.error('Erro ao registrar agendamento:', error);
    }
}

// Function to load employee data for the 'closer' dropdowns
async function loadEmployees() {
    try {
        const response = await fetch('/api/get-employees');
        if (!response.ok) {
            throw new Error('Error loading Salespersons data.');
        }
        const employees = await response.json();
        
        const closer1Select = document.getElementById('closer1');
        const closer2Select = document.getElementById('closer2');
        
        if (employees && Array.isArray(employees)) {
            employees.forEach(employee => {
                if (employee) {
                    const option1 = document.createElement('option');
                    option1.value = employee;
                    option1.textContent = employee;
                    closer1Select.appendChild(option1);

                    const option2 = document.createElement('option');
                    option2.value = employee;
                    option2.textContent = employee;
                    closer2Select.appendChild(option2);
                }
            });
        }
    } catch (error) {
        console.error('Error populating Salespersons:', error);
    }
}

// Event listener to handle all initial setup and actions
document.addEventListener('DOMContentLoaded', async () => {
    // Call the counting function to populate the initial value
    fetchAndCountAppointments();
    fetchAndCountCustomersThisMonth();
    fetchAndCountPetsThisMonth(); // New function call added
    
    // Populate dropdowns and set default values
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const currentDate = today.toISOString().slice(0, 10);
    
    const monthSelect = document.getElementById('month');
    const yearSelect = document.getElementById('year');
    const dateInput = document.getElementById('data');
    const customersInput = document.getElementById('customers');
    const codePassDisplay = document.getElementById('codePassDisplay');
    const appointmentDateInput = document.getElementById('appointmentDate');
    const reminderDateDisplay = document.getElementById('reminderDateDisplay');

    // Create hidden inputs for form submission
    const codePassInput = document.createElement('input');
    codePassInput.type = 'hidden';
    codePassInput.id = 'codePass';
    codePassInput.name = 'codePass';
    document.getElementById('scheduleForm').appendChild(codePassInput);

    const reminderDateInput = document.createElement('input');
    reminderDateInput.type = 'hidden';
    reminderDateInput.id = 'reminderDate';
    reminderDateInput.name = 'reminderDate';
    document.getElementById('scheduleForm').appendChild(reminderDateInput);

    if (monthSelect) monthSelect.value = currentMonth.toString();
    if (yearSelect) yearSelect.value = currentYear.toString();
    if (dateInput) dateInput.value = currentDate;
    
    // Add event listeners
    document.getElementById('scheduleForm').addEventListener('submit', handleFormSubmission);
    
    appointmentDateInput.addEventListener('input', (event) => {
        const appointmentDateValue = event.target.value;
        if (appointmentDateValue) {
            const appointmentDate = new Date(appointmentDateValue);
            appointmentDate.setMonth(appointmentDate.getMonth() + 5);
            const displayDate = formatDateToYYYYMMDD(appointmentDate);
            reminderDateDisplay.textContent = displayDate;
            const apiDate = appointmentDate.toISOString().split('T')[0];
            reminderDateInput.value = apiDate;
        } else {
            reminderDateDisplay.textContent = '--/--/----';
            reminderDateInput.value = '';
        }
    });

    customersInput.addEventListener('input', () => {
        const value = customersInput.value.trim();
        if (value.length > 0) {
            const randomNumber = Math.floor(Math.random() * 10000);
            const paddedNumber = randomNumber.toString().padStart(4, '0');
            codePassDisplay.textContent = paddedNumber;
            codePassInput.value = paddedNumber;
        } else {
            codePassDisplay.textContent = '--/--/----';
            codePassInput.value = '';
        }
    });

    loadEmployees(); // Load closer/employee data
});
