// public/manage-showed.js

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('showed-table-body');

    // Opções para os dropdowns
    const petOptions = Array.from({ length: 10 }, (_, i) => i + 1);
    const paymentOptions = ["Check", "American Express", "Apple Pay", "Discover", "Master Card", "Visa", "Zelle", "Cash", "Invoice"];
    const verificationOptions = ["Showed", "Canceled"];

    // Função para renderizar a tabela com os dados
    function renderTable(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10" class="p-4 text-center text-muted-foreground">Nenhum agendamento encontrado.</td></tr>';
            return;
        }

        data.forEach((appointment, index) => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-border', 'hover:bg-muted/50', 'transition-colors');

            row.innerHTML = `
                <td class="p-4">${appointment.appointmentDate}</td>
                <td class="p-4">${appointment.customers}</td>
                <td class="p-4 code-cell">${appointment.code}</td>
                <td class="p-4"><input type="text" value="${appointment.technician || ''}" style="width: 100px;" class="bg-transparent border border-border rounded-md px-2"></td>
                <td class="p-4">
                    <select style="width: 60px;" class="bg-transparent border border-border rounded-md px-2">
                        <option value="">Pets...</option>
                        ${petOptions.map(num => `<option value="${num}">${num}</option>`).join('')}
                    </select>
                </td>
                <td class="p-4"><input type="text" value="${appointment.serviceShowed || ''}" style="width: 100px;" class="bg-transparent border border-border rounded-md px-2"></td>
                <td class="p-4"><input type="text" value="${appointment.tips || ''}" style="width: 80px;" class="bg-transparent border border-border rounded-md px-2" placeholder="$0.00"></td>
                <td class="p-4">
                    <select style="width: 120px;" class="bg-transparent border border-border rounded-md px-2">
                        <option value="">Select...</option>
                        ${paymentOptions.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                </td>
                <td class="p-4">
                    <select style="width: 100px;" class="bg-transparent border border-border rounded-md px-2">
                        <option value="">Select...</option>
                        ${verificationOptions.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                </td>
                <td class="p-4">
                    <button class="save-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-brand-primary text-white hover:shadow-brand" data-index="${index}">Save</button>
                </td>
            `;

            // Preenche os valores iniciais dos dropdowns, se existirem
            const petSelect = row.querySelector('select:nth-of-type(1)');
            if (appointment.petShowed) {
                petSelect.value = appointment.petShowed;
            }

            const paymentSelect = row.querySelector('select:nth-of-type(2)');
            if (appointment.paymentMethod) {
                paymentSelect.value = appointment.paymentMethod;
            }

            const verificationSelect = row.querySelector('select:nth-of-type(3)');
            if (appointment.verification) {
                verificationSelect.value = appointment.verification;
            }

            tableBody.appendChild(row);
        });
    }

    // Função principal para buscar os dados e renderizar a página
    async function initPage() {
        try {
            const response = await fetch('/api/get-customers-data');
            if (!response.ok) {
                throw new Error('Failed to load appointment data.');
            }
            const data = await response.json();
            const appointmentsData = data.customers;

            renderTable(appointmentsData);

        } catch (error) {
            console.error('Error fetching data:', error);
            tableBody.innerHTML = '<tr><td colspan="10" class="p-4 text-center text-red-600">Erro ao carregar dados. Tente novamente.</td></tr>';
        }
    }

    // Event listener para a ação de salvar
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('save-btn')) {
            const row = event.target.closest('tr');
            const rowIndex = event.target.dataset.index;

            const inputs = row.querySelectorAll('input');
            const selects = row.querySelectorAll('select');

            const rowData = {
                rowIndex: parseInt(rowIndex, 10),
                technician: inputs[0].value,
                petShowed: selects[0].value,
                serviceShowed: inputs[1].value,
                tips: inputs[2].value,
                paymentMethod: selects[1].value,
                verification: selects[2].value,
            };

            try {
                const response = await fetch('/api/update-appointment-showed-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(rowData),
                });
                const result = await response.json();
                if (result.success) {
                    alert('Dados atualizados com sucesso!');
                    initPage(); // Recarrega a tabela para mostrar os dados atualizados
                } else {
                    alert(`Erro ao salvar: ${result.message}`);
                }
            } catch (error) {
                console.error('Erro na requisição da API:', error);
                alert('Erro na comunicação com o servidor. Tente novamente.');
            }
        }
    });

    initPage();
});
