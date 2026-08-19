// Массив для хранения лекарств
let medicines = JSON.parse(localStorage.getItem('medicines')) || [];
let currentFilter = ''; // Текущий фильтр по назначению

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateTable();
    updateExpiringList();

    // Обработчики событий
    document.getElementById('sortByNameBtn').addEventListener('click', sortByName);
    document.getElementById('purposeFilter').addEventListener('input', applyFilter);
    document.getElementById('clearFilterBtn').addEventListener('click', clearFilter);
});

// Обработка формы добавления лекарства
document.getElementById('medicineForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const purpose = document.getElementById('purpose').value;
    const expiryDate = document.getElementById('expiryDate').value;
    
    // Добавляем новое лекарство в массив
    medicines.push({
        id: Date.now(), // Уникальный идентификатор
        name: name,
        purpose: purpose,
        expiryDate: expiryDate
    });
    
    // Сохраняем в localStorage
    localStorage.setItem('medicines', JSON.stringify(medicines));
    
    // Обновляем интерфейс
    applyFilter(); // Применяем текущий фильтр после добавления
    updateExpiringList();
    
    // Очищаем форму
    document.getElementById('medicineForm').reset();
});

// Обновление таблицы со всеми лекарствами
function updateTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    // Применяем фильтр перед отображением
    const filteredMedicines = currentFilter
        ? medicines.filter(medicine =>
            medicine.purpose.toLowerCase().includes(currentFilter.toLowerCase())
        )
        : medicines;
    
    filteredMedicines.forEach(medicine => {
        const row = document.createElement('tr');
        
        // Проверяем, истекает ли срок годности менее чем через месяц
        const isExpiring = checkExpiring(medicine.expiryDate);
        
        row.innerHTML = `
            <td>${medicine.name}</td>
            <td>${medicine.purpose}</td>
            <td class="${isExpiring ? 'expiring' : ''}">${formatDate(medicine.expiryDate)}</td>
            <td>
                <button class="delete-btn" onclick="deleteMedicine(${medicine.id})">Удалить</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Обновление списка лекарств с истекающим сроком
function updateExpiringList() {
    const expiringList = document.getElementById('expiringList');
    expiringList.innerHTML = '';
    
    const expiringMedicines = medicines.filter(medicine => checkExpiring(medicine.expiryDate));
    
    if (expiringMedicines.length === 0) {
        expiringList.innerHTML = '<p>Лекарств с истекающим сроком годности нет</p>';
        return;
    }
    
    expiringMedicines.forEach(medicine => {
        const item = document.createElement('div');
        item.className = 'expiring-item';
        item.innerHTML = `
            <strong>${medicine.name}</strong><br>
            Срок годности: ${formatDate(medicine.expiryDate)}<br>
            Назначение: ${medicine.purpose}
        `;
        expiringList.appendChild(item);
    });
}

// Проверка, истекает ли срок годности менее чем через месяц
function checkExpiring(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    // Добавляем 30 дней к текущей дате для проверки
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    // Если срок годности меньше или равен дате через 30 дней и больше текущей даты — лекарство скоро истечёт
    return expiry <= thirtyDaysLater && expiry > today;
}

// Форматирование даты для отображения (YYYY-MM-DD → DD.MM.YYYY)
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяц начинается с 0
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
}

// Удаление лекарства
function deleteMedicine(id) {
    // Фильтруем массив, оставляя только лекарства с другим ID
    medicines = medicines.filter(medicine => medicine.id !== id);
    
    // Сохраняем обновлённый массив в localStorage
    localStorage.setItem('medicines', JSON.stringify(medicines));
    
    // Обновляем интерфейс
    applyFilter(); // Переприменяем фильтр после удаления
    updateExpiringList();
}

// Сортировка по названию (А–Я)
function sortByName() {
    medicines.sort((a, b) => a.name.localeCompare(b.name));
    localStorage.setItem('medicines', JSON.stringify(medicines));
    applyFilter(); // Обновляем таблицу с учётом сортировки и фильтра
}

// Применение фильтра по назначению
function applyFilter() {
    currentFilter = document.getElementById('purposeFilter').value;
    updateTable(); // Перерисовываем таблицу с фильтром
}

// Очистка фильтра
function clearFilter() {
    document.getElementById('purposeFilter').value = '';
    currentFilter = '';
    updateTable();
}