document.addEventListener("DOMContentLoaded", () => {
    const dashboard = document.querySelector(".admin-dashboard");
    if (!dashboard) return;

    const totals = {
        "total-users": parseInt(dashboard.dataset.totalUsers || "0", 10),
        "total-tasks": parseInt(dashboard.dataset.totalTasks || "0", 10),
        pending: parseInt(dashboard.dataset.pending || "0", 10),
        "in-progress": parseInt(dashboard.dataset.inProgress || "0", 10),
        completed: parseInt(dashboard.dataset.completed || "0", 10),
    };

    Object.entries(totals).forEach(([key, value]) => {
        const el = dashboard.querySelector(`[data-target="${key}"]`);
        if (!el) return;
        let current = 0;
        const increment = Math.max(1, Math.floor(value / 30));
        const interval = setInterval(() => {
            current += increment;
            if (current >= value) {
                current = value;
                clearInterval(interval);
            }
            el.textContent = current.toString();
        }, 20);
    });

    const canvas = document.getElementById("statusChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const chartData = [totals.pending, totals["in-progress"], totals.completed];
    const labels = ["Pending", "In Progress", "Completed"];
    const colors = ["#f59e0b", "#3b82f6", "#10b981"];

    const max = Math.max(...chartData, 1);
    const chartHeight = canvas.height - 40;
    const barWidth = 60;
    const gap = 40;
    const originX = 50;
    const originY = canvas.height - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "14px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.strokeStyle = "#d1d5db";

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(canvas.width - 10, originY);
    ctx.stroke();

    chartData.forEach((value, index) => {
        const barHeight = (value / max) * chartHeight;
        const x = originX + index * (barWidth + gap);
        const y = originY - barHeight;
        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillStyle = "#111827";
        ctx.fillText(value.toString(), x + barWidth / 2 - 10, y - 8);
        ctx.fillStyle = "#374151";
        ctx.fillText(labels[index], x + 5, originY + 18);
    });
});
