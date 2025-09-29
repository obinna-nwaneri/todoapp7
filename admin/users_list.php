<?php
/**
 * admin/users_list.php
 * ---------------------
 * Lists all users for administration with optional search functionality.
 */

require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';

$search = trim($_GET['search'] ?? '');
$params = [];
$where = '';

if ($search !== '') {
    $where = 'WHERE username LIKE :term OR email LIKE :term';
    $params[':term'] = '%' . $search . '%';
}

$query = "SELECT id, username, email, role, created_at FROM users {$where} ORDER BY created_at DESC";
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$users = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Users</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<?php include __DIR__ . '/../partials/admin_nav.php'; ?>
<div class="container py-4">
    <?php include __DIR__ . '/../partials/alerts.php'; ?>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Users</h1>
        <a class="btn btn-primary" href="/admin/users_add.php">Add User</a>
    </div>
    <form class="row g-3 mb-4" method="get">
        <div class="col-md-4">
            <input type="text" name="search" class="form-control" placeholder="Search username or email" value="<?= htmlspecialchars($search) ?>">
        </div>
        <div class="col-md-2">
            <button class="btn btn-outline-secondary" type="submit">Search</button>
            <a class="btn btn-link" href="/admin/users_list.php">Reset</a>
        </div>
    </form>
    <div class="table-responsive">
        <table class="table table-striped align-middle">
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
                <?php if (!$users): ?>
                    <tr>
                        <td colspan="6" class="text-center text-muted">No users found.</td>
                    </tr>
                <?php endif; ?>
                <?php foreach ($users as $user): ?>
                    <tr>
                        <td><?= (int) $user['id'] ?></td>
                        <td><?= htmlspecialchars($user['username']) ?></td>
                        <td><?= htmlspecialchars($user['email']) ?></td>
                        <td><span class="badge bg-<?= $user['role'] === 'admin' ? 'danger' : 'secondary' ?>"><?= htmlspecialchars(ucfirst($user['role'])) ?></span></td>
                        <td><?= htmlspecialchars($user['created_at']) ?></td>
                        <td class="d-flex gap-2">
                            <a class="btn btn-sm btn-outline-primary" href="/admin/users_edit.php?id=<?= (int) $user['id'] ?>">Edit</a>
                            <?php if ($user['id'] !== $_SESSION['user_id']): ?>
                                <form method="post" action="/admin/users_delete.php" onsubmit="return confirm('Delete this user? This will remove their tasks.');">
                                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token()) ?>">
                                    <input type="hidden" name="id" value="<?= (int) $user['id'] ?>">
                                    <button class="btn btn-sm btn-outline-danger" type="submit">Delete</button>
                                </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
