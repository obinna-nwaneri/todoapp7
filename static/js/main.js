document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.querySelector('#filters');
    if (filterForm) {
        filterForm.querySelectorAll('select, input[type="search"]').forEach((element) => {
            element.addEventListener('change', () => {
                filterForm.submit();
            });
        });
    }

    document.querySelectorAll('form[data-confirm]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            const message = form.getAttribute('data-confirm');
            if (!window.confirm(message || 'Are you sure?')) {
                event.preventDefault();
            }
        });
    });
});
