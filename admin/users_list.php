<?php
require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../public/layout.php';
require_once __DIR__ . '/../helpers/csrf.php';

$search = trim($_GET['q'] ?? '');
$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = 10;
$offset = ($page - 1) * $perPage;

$where = '';
$params = [];
if ($search !== '') {
    $where = 'WHERE username LIKE :search OR email LIKE :search';
    $params[':search'] = '%' . $search . '%';
}

$countStmt = $pdo->prepare('SELECT COUNT(*) FROM users ' . $where);
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();
$totalPages = max(1, (int)ceil($total / $perPage));

$listStmt = $pdo->prepare('SELECT * FROM users ' . $where . ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
foreach ($params as $key => $value) {
    $listStmt->bindValue($key, $value, PDO::PARAM_STR);
}
$listStmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
$listStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$listStmt->execute();
$users = $listStmt->fetchAll();

render_layout_header('Manage Users');
?>
<div class="d-flex justify-content-between align-items-center mb-3">
    <h1 class="h3">Users</h1>
    <a href="/admin/users_add.php" class="btn btn-primary">Add User</a>
</div>
<?php include __DIR__ . '/../partials/alerts.php'; ?>
<form method="get" class="row g-2 mb-4">
    <div class="col-md-6">
        <input type="text" name="q" class="form-control" placeholder="Search by username or email" value="<?= htmlspecialchars($search) ?>">
    </div>
    <div class="col-md-2">
        <button type="submit" class="btn btn-outline-secondary">Search</button>
    </div>
    <?php if ($search !== ''): ?>
        <div class="col-md-2">
            <a href="/admin/users_list.php" class="btn btn-light">Clear</a>
        </div>
    <?php endif; ?>
</form>
<div class="table-responsive">
    <table class="table table-hover align-middle">
        <thead>
            <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($users)): ?>
                <tr><td colspan="6" class="text-center">No users found.</td></tr>
            <?php else: ?>
                <?php foreach ($users as $user): ?>
                    <tr>
                        <td><?= htmlspecialchars($user['id']) ?></td>
                        <td><?= htmlspecialchars($user['username']) ?></td>
                        <td><?= htmlspecialchars($user['email']) ?></td>
                        <td class="text-capitalize"><?= htmlspecialchars($user['role']) ?></td>
                        <td><?= htmlspecialchars($user['created_at']) ?></td>
                        <td>
                            <a href="/admin/users_edit.php?id=<?= urlencode($user['id']) ?>" class="btn btn-sm btn-outline-primary">Edit</a>
                            <?php if ($user['id'] !== $_SESSION['user_id']): ?>
                                <form action="/admin/users_delete.php" method="post" class="d-inline" onsubmit="return confirm('Delete this user?');">
                                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generate_csrf_token()) ?>">
                                    <input type="hidden" name="id" value="<?= htmlspecialchars($user['id']) ?>">
                                    <button type="submit" class="btn btn-sm btn-outline-danger">Delete</button>
                                </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>
<nav>
    <ul class="pagination">
        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
            <?php
                $queryParams = $_GET;
                $queryParams['page'] = $i;
                $url = '/admin/users_list.php?' . http_build_query($queryParams);
            ?>
            <li class="page-item <?= $i === $page ? 'active' : '' ?>">
                <a class="page-link" href="<?= htmlspecialchars($url) ?>"><?= $i ?></a>
            </li>
        <?php endfor; ?>
    </ul>
</nav>
<?php
render_layout_footer();
