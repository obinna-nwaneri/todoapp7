document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("button[data-confirm], a[data-confirm]").forEach((el) => {
        el.addEventListener("click", (event) => {
            const message = el.getAttribute("data-confirm") || "Are you sure?";
            if (!window.confirm(message)) {
                event.preventDefault();
            }
        });
    });

    const filterForm = document.getElementById("task-filter-form");
    if (filterForm) {
        filterForm.querySelectorAll("select").forEach((select) => {
            select.addEventListener("change", () => filterForm.submit());
        });
    }
});
