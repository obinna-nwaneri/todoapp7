</main>
<footer class="bg-white border-top py-3 mt-auto">
    <div class="container text-center">
        <span class="text-muted">&copy; <?= date('Y') ?> Todo App</span>
    </div>
</footer>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
<?php if (!empty($pageScripts)) { echo $pageScripts; } ?>
</body>
</html>
