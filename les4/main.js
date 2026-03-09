const films = document.getElementById('films');
const createFilm = document.getElementById('createFilm');
const validateFilm = (data) => {
    const errors = {};
    if (!data.name || data.name.trim().length <= 10) {
        errors.name = 'Название должно быть больше 10 символов';
    }
    const year = Number(data.year);
    if (!data.year || isNaN(year) || year < 1900 || year > 2026) {
        errors.year = 'Год должен быть от 1900 до 2026';
    }
    const imgPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
    if (!data.img_preview || !imgPattern.test(data.img_preview.trim())) {
        errors.img_preview = 'Введите валидную ссылку на изображение (.jpg, .png и т.д.)';
    }
    return errors;
};
const toggleError = (field, error, show) => {
    const input = createFilm.elements[field];
    const errorMsg = input.parentElement.querySelector('.error-msg');
    
    if (show) {
        input.classList.add('error');
        input.classList.remove('success');
        if (errorMsg) {
            errorMsg.textContent = error;
            errorMsg.classList.add('show');
        }
    } else {
        input.classList.remove('error');
        input.classList.add('success');
        if (errorMsg) errorMsg.classList.remove('show');
    }
};
const clearErrors = () => {
    createFilm.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
    createFilm.querySelectorAll('input').forEach(el => {
        el.classList.remove('error', 'success');
    });
};
const getFilms = async () => {
    try {
        const response = await fetch('http://localhost:5000/films');
        const filmsData = await response.json();
        renderFilm(filmsData);
    } catch (error) {
        console.log(error);
    }
};
const renderFilm = (allFilms) => {
    films.innerHTML = '';
    allFilms.forEach(film => {
        const cont = document.createElement('div');
        const img = document.createElement('img');
        const p = document.createElement('p');
        const year = document.createElement('p');
        const btnDelete = document.createElement('button');
        cont.className = 'kinoCont';
        btnDelete.textContent = 'Удалить';
        img.setAttribute('src', film.img_preview.trim());
        p.textContent = film.name;
        year.textContent = film.year;
        btnDelete.onclick = () => deleteFilm(film.id);
        cont.append(img, p, year, btnDelete);
        films.appendChild(cont);
    });
};
createFilm.onsubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    const formData = new FormData(createFilm);
    const data = {
        name: formData.get('name')?.trim(),
        year: formData.get('year')?.trim(),
        img_preview: formData.get('img_preview')?.trim(),
        description: formData.get('description')?.trim(),
    };
    const errors = validateFilm(data);
    
    if (Object.keys(errors).length > 0) {
        if (errors.name) toggleError('name', errors.name, true);
        if (errors.year) toggleError('year', errors.year, true);
        if (errors.img_preview) toggleError('img_preview', errors.img_preview, true);
        return;
    }
    try {
        await fetch('http://localhost:5000/films', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(data),
        });
        alert('✅ Фильм создан!');
        createFilm.reset();
        getFilms();
    } catch (error) {
        console.log(error);
        alert('❌ Ошибка при создании фильма');
    }
};
const deleteFilm = async (id) => {
    if (!confirm('Удалить этот фильм?')) return;
    
    try {
        await fetch(`http://localhost:5000/films/${id}`, {
            method: 'DELETE'
        });
        alert('Фильм удалён!');
        getFilms();
    } catch (error) {
        console.log(error); 
        alert('❌ Ошибка при удалении');
    }
};
getFilms();
createFilm.addEventListener('input', (e) => {
    if (e.target.classList.contains('error')) {
        const field = e.target.name;
        const value = e.target.value.trim();
        const testObj = { ...createFilm.dataset, [field]: value };
        const errors = validateFilm(testObj);
        if (!errors[field]) toggleError(field, '', false);
    }
});