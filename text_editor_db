<?php
header('Content-Type: application/json');
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'text_editor_db';

// Connect to MySQL
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Fetch all texts
$result = $conn->query("SELECT * FROM texts ORDER BY created_at DESC");
$texts = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode(['texts' => $texts]);
?>
