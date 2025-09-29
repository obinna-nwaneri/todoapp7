(function () {
    window.metricCards = function metricCards(initial) {
        const counters = {};
        Object.keys(initial).forEach((key) => {
            counters[key] = 0;
        });
        return {
            counters,
            target: initial,
            animate() {
                Object.keys(this.counters).forEach((key) => {
                    const start = this.counters[key];
                    const end = this.target[key];
                    if (start === end) return;
                    const step = Math.max(1, Math.abs(end - start) / 12);
                    const increment = start < end ? step : -step;
                    const update = () => {
                        this.counters[key] = Math.round(this.counters[key] + increment);
                        if ((increment > 0 && this.counters[key] >= end) || (increment < 0 && this.counters[key] <= end)) {
                            this.counters[key] = end;
                        } else {
                            requestAnimationFrame(update);
                        }
                    };
                    requestAnimationFrame(update);
                });
            },
            init() {
                this.animate();
            },
        };
    };

    let chartCtx = null;

    function prepareCanvas() {
        if (!chartCtx) return;
        const canvas = chartCtx.canvas;
        const ratio = window.devicePixelRatio || 1;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        chartCtx.setTransform(1, 0, 0, 1, 0, 0);
        chartCtx.scale(ratio, ratio);
    }

    function drawChart(data) {
        if (!chartCtx) return;
        prepareCanvas();
        const canvas = chartCtx.canvas;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const { pending, inProgress, completed } = data;
        const values = [pending, inProgress, completed];
        const labels = ["Pending", "In Progress", "Completed"];
        const colors = ["#f59f00", "#0d6efd", "#198754"];
        chartCtx.clearRect(0, 0, width, height);
        const maxValue = Math.max(...values, 1);
        const barWidth = width / (values.length * 2);
        values.forEach((value, index) => {
            const x = (index * 2 + 1) * barWidth;
            const barHeight = (value / maxValue) * (height - 40);
            const y = height - barHeight - 20;
            chartCtx.fillStyle = colors[index];
            chartCtx.fillRect(x, y, barWidth, barHeight);
            chartCtx.fillStyle = "#495057";
            chartCtx.font = "14px sans-serif";
            chartCtx.textAlign = "center";
            chartCtx.fillText(labels[index], x + barWidth / 2, height - 5);
            chartCtx.fillText(String(value), x + barWidth / 2, y - 6);
        });
    }

    function extractMetrics() {
        const metrics = document.getElementById('metrics');
        if (!metrics) return null;
        return {
            pending: parseInt(metrics.dataset.pending || '0', 10),
            inProgress: parseInt(metrics.dataset.inProgress || '0', 10),
            completed: parseInt(metrics.dataset.completed || '0', 10),
        };
    }

    function refreshChart() {
        const metricsData = extractMetrics();
        if (metricsData) {
            drawChart(metricsData);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('task-status-chart');
        if (canvas) {
            chartCtx = canvas.getContext('2d');
            refreshChart();
        }
    });

    document.body.addEventListener('htmx:afterSwap', (event) => {
        if (event.target && event.target.id === 'metrics') {
            refreshChart();
        }
    });
})();
