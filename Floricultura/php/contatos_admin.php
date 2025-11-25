<?php
session_start();
require_once 'conexao.php';

// Verificar se é admin
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'admin') {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['error' => 'Acesso negado']);
    exit();
}

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

// Obter contatos
if ($_GET['action'] == 'get') {
    $query = "SELECT * FROM contatos ORDER BY data_contato DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $contatos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $contatos[] = $row;
    }
    
    echo json_encode($contatos);
}

// Obter contatos não lidos
elseif ($_GET['action'] == 'nao_lidos') {
    $query = "SELECT COUNT(*) as total FROM contatos WHERE lido = 0";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['nao_lidos' => $result['total']]);
}

// Marcar como lido
elseif ($_POST['action'] == 'marcar_lido') {
    $contato_id = $_POST['contato_id'];
    
    $query = "UPDATE contatos SET lido = 1 WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $contato_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
}

// Marcar como respondido
elseif ($_POST['action'] == 'marcar_respondido') {
    $contato_id = $_POST['contato_id'];
    
    $query = "UPDATE contatos SET respondido = 1 WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $contato_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
}

// Excluir contato
elseif ($_POST['action'] == 'excluir') {
    $contato_id = $_POST['contato_id'];
    
    $query = "DELETE FROM contatos WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $contato_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
}
?>