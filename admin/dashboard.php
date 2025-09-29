<?php
require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../public/layout.php';

$totalUsers = $pdo->query('SELECT COUNT(*) AS count FROM users')->fetch()['count'] ?? 0;
$totalTasks = $pdo->query('SELECT COUNT(*) AS count FROM tasks')->fetch()['count'] ?? 0;
$statusCountsStmt = $pdo->query("SELECT status, COUNT(*) AS count FROM tasks GROUP BY status");
$statusCounts = $statusCountsStmt->fetchAll(PDO::FETCH_KEY_PAIR);

render_layout_header('Admin Dashboard');
?>
<h1 class="mb-4">Admin Dashboard</h1>
<?php include __DIR__ . '/../partials/alerts.php'; ?>
<div class="row g-4">
    <div class="col-md-4">
        <div class="card border-primary shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Total Users</h5>
                <p class="display-6 mb-0"><?= htmlspecialchars($totalUsers) ?></p>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card border-success shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Total Tasks</h5>
                <p class="display-6 mb-0"><?= htmlspecialchars($totalTasks) ?></p>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card border-info shadow-sm">
            <div class="card-body">
                <h5 class="card-title">Tasks by Status</h5>
                <ul class="list-unstyled mb-0">
                    <li>Pending: <?= htmlspecialchars($statusCounts['pending'] ?? 0) ?></li>
                    <li>In Progress: <?= htmlspecialchars($statusCounts['in_progress'] ?? 0) ?></li>
                    <li>Completed: <?= htmlspecialchars($statusCounts['completed'] ?? 0) ?></li>
                </ul>
            </div>
        </div>
    </div>
</div>
<?php
render_layout_footer();
