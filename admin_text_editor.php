<?php
session_start();
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'text_editor_db';

// Connect to MySQL
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// Create table if not exists
$sql = "CREATE TABLE IF NOT EXISTS texts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($sql);

// Handle login
if (isset($_POST['login'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    // Simple hardcoded admin check (replace with database check in production)
    if ($username === 'admin' && $password === 'admin123') {
        $_SESSION['user'] = 'admin';
    } else {
        $_SESSION['user'] = 'guest';
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: admin_text_editor.php");
    exit;
}

// Handle text submission (Admin only)
if (isset($_POST['submit_text']) && $_SESSION['user'] === 'admin') {
    $content = $_POST['content'];
    $stmt = $conn->prepare("INSERT INTO texts (content) VALUES (?)");
    $stmt->bind_param("s", $content);
    $stmt->execute();
}

// Handle text deletion (Admin only)
if (isset($_GET['delete']) && $_SESSION['user'] === 'admin') {
    $id = $_GET['delete'];
    $conn->query("DELETE FROM texts WHERE id = $id");
}

// Fetch all texts
$result = $conn->query("SELECT * FROM texts ORDER BY created_at DESC");
$texts = $result->fetch_all(MYSQLI_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Text Editor</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Text Editor</h1>

    <?php if (!isset($_SESSION['user'])): ?>
        <!-- Login Form -->
        <form method="POST">
            <h2>Login</h2>
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button type="submit" name="login">Login</button>
        </form>

    <?php else: ?>
        <!-- Logout Button -->
        <p>Logged in as: <strong><?= $_SESSION['user'] ?></strong> | <a href="?logout">Logout</a></p>

        <!-- Text Display (All Users) -->
        <h2>Text Entries</h2>
        <?php if (empty($texts)): ?>
            <p>No texts yet.</p>
        <?php else: ?>
            <?php foreach ($texts as $text): ?>
                <div class="text-box">
                    <p><?= htmlspecialchars($text['content']) ?></p>
                    <?php if ($_SESSION['user'] === 'admin'): ?>
                        <div class="admin-controls">
                            <a href="?delete=<?= $text['id'] ?>" onclick="return confirm('Delete this?')">Delete</a>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>

        <!-- Text Submission Form (Admin Only) -->
        <?php if ($_SESSION['user'] === 'admin'): ?>
            <h2>Add New Text</h2>
            <form method="POST">
                <textarea name="content" rows="4" style="width: 100%;" required></textarea><br>
                <button type="submit" name="submit_text">Submit</button>
            </form>
        <?php endif; ?>
    <?php endif; ?>
</body>
</html>
