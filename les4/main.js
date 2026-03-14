const countriesContainer = document.getElementById('countries');
const resultCountry = document.getElementById('resultCountry');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const searchStatus = document.getElementById('searchStatus');
const loading = document.getElementById('loading');
let allCountriesData = [];
let searchTimeout;
const getAllCountries = async () => {
    try {
        loading.style.display = 'block';
        loading.textContent = 'Загрузка данных...';
        loading.style.color = 'rgba(255,255,255,0.7)';
        countriesContainer.innerHTML = '';
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,capital');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Получены некорректные данные от сервера');
        }
        allCountriesData = data;
        renderCountries(data, countriesContainer);
    } catch (error) {
        console.error('❌ Ошибка загрузки стран:', error);
        loading.textContent = '❌ Ошибка загрузки. Проверьте интернет и обновите страницу.';
        loading.style.color = '#ff6b6b';
        loading.style.display = 'block';
    } finally {
        if (!loading.textContent.includes('Ошибка')) {
            loading.style.display = 'none';
        }
    }
};
const renderCountries = (data, container) => {
    container.innerHTML = '';
    if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<p class="no-results">😕 Страны не найдены</p>';
        console.warn('⚠️ Пустой результат для отрисовки');
        return;
    }
    data.forEach(country => {
        try {
            const card = document.createElement('div');
            card.className = 'country-card';
            card.setAttribute('role', 'article');
            const flag = document.createElement('img');
            flag.src = country.flags?.svg || country.flags?.png || '';
            flag.alt = `Флаг ${country.name?.common || 'страны'}`;
            flag.loading = 'lazy';
            flag.onerror = () => {
                flag.src = 'https://via.placeholder.com/120x80?text=🏳️';
                flag.alt = 'Флаг недоступен';
            };
            const name = document.createElement('p');
            name.className = 'country-name';
            name.textContent = country.name?.common || 'Неизвестно';
            const capital = document.createElement('p');
            capital.className = 'country-capital';
            capital.textContent = country.capital?.[0] || 'Столица неизвестна';
            card.append(flag, name, capital);
            container.appendChild(card);
        } catch (err) {
            console.error('❌ Ошибка при рендере карточки:', err, country);
        }
    });
};
const searchCountries = () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        searchStatus.textContent = '';
        searchStatus.style.color = '';
        resultCountry.innerHTML = '';
        console.log('⚠️ Поиск отменён: поле ввода пустое');
        return;
    }
    searchStatus.textContent = '🔍 Поиск...';
    searchStatus.style.color = '#7eb3f9';
    const filtered = allCountriesData.filter(country => {
        const nameCommon = country.name?.common?.toLowerCase() || '';
        const nameOfficial = country.name?.official?.toLowerCase() || '';
        const capital = country.capital?.[0]?.toLowerCase() || '';
        return nameCommon.includes(query) ||
               nameOfficial.includes(query) ||
               capital.includes(query);
    });
    resultCountry.innerHTML = '';
    if (filtered.length > 0) {
        searchStatus.textContent = `✅ Найдено: ${filtered.length} стран(ы)`;
        searchStatus.style.color = '#7eb3f9';
        renderCountries(filtered, resultCountry);
    } else {
        console.warn('❌ Страна не найдена по запросу:', query);
        searchStatus.textContent = '❌ Страна не найдена';
        searchStatus.style.color = '#ff6b6b';
        resultCountry.innerHTML = '<p class="no-results">😕 Попробуйте другой запрос</p>';
    }
};
const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchCountries, 300);
};
const resetSearch = () => {
    searchInput.value = '';
    searchStatus.textContent = '';
    searchStatus.style.color = '';
    resultCountry.innerHTML = '';
    searchInput.focus();
    console.log('🔄 Поиск сброшен');
};
searchBtn.addEventListener('click', searchCountries);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchCountries();
    }
});
searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() === '') {
        resetSearch();
    } else {
        debouncedSearch();
    }
});
resetBtn.addEventListener('click', resetSearch);
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌍 Приложение запущено');
    getAllCountries();
});