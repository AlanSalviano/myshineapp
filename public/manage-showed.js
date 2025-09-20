// public/manage-showed.js

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('showed-table-body');

    // Função para renderizar a tabela com os dados
    function renderTable(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="11" class="p-4 text-center text-muted-foreground">Nenhum agendamento encontrado.</td></tr>';
            return;
        }

        data.forEach((appointment, index) => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-border', 'hover:bg-muted/50', 'transition-colors');
            
            // Determina qual closer é o 'Technician' principal
            const technician = appointment.closer1 || appointment.closer2;

            row.innerHTML = `
                <td class="p-4">${appointment.appointmentDate}</td>
                <td class="p-4">${appointment.customers}</td>
                <td class="p-4 code-cell">${appointment.code}</td>
                <td class="p-4">${technician}</td>
                <td class="p-4"><input type="number" value="${appointment.pets || ''}" style="width: 60px;" class="bg-transparent border border-border rounded-md px-2"></td>
                <td class="p-4"><input type="text" value="${appointment.serviceShowed || ''}" style="width: 100px;" class="bg-transparent border border-border rounded-md px-2"></td>
                <td class="p-4"><input type="text" value="${appointment.tips || ''}" style="width: 80px;" class="bg-transparent border border-border rounded-md px-2" placeholder="$0.00"></td>
                <td class="p-4"><input type="text" value="${appointment.paymentMethod || ''}" style="width: 100px;" class="bg-transparent border border-border rounded-md px-2"></td>
                <td class="p-4"><input type="text" value="${appointment.paymentId || ''}" style="width: 100px;" class="bg-transparent border border-border rounded-md px-2"></td>
                <td class="p-4"><input type="text" value="${appointment.verification || ''}" style="width: 100px;" class="bg-transparent border border-border rounded-md px-2"></td>
                <td class="p-4">
                    <button class="save-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-brand-primary text-white hover:shadow-brand">Save</button>
                </td>
            `;
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
            tableBody.innerHTML = '<tr><td colspan="11" class="p-4 text-center text-red-600">Erro ao carregar dados. Tente novamente.</td></tr>';
        }
    }

    // Event listener para a ação de salvar
    tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('save-btn')) {
            const row = event.target.closest('tr');
            const inputs = row.querySelectorAll('input');
            
            const code = row.querySelector('.code-cell').textContent;

            const rowData = {
                code: code,
                technician: row.cells[3].textContent,
                petShowed: inputs[0].value,
                serviceShowed: inputs[1].value,
                tips: inputs[2].value,
                paymentMethod: inputs[3].value,
                paymentId: inputs[4].value,
                verification: inputs[5].value,
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
