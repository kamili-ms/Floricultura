<?php
require_once 'conexao.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

// Obter produtos em destaque
if ($_GET['action'] == 'destaques') {
    $query = "SELECT p.*, c.nome as categoria_nome 
              FROM produtos p 
              LEFT JOIN categorias c ON p.categoria_id = c.id 
              WHERE p.ativo = 1 
              ORDER BY p.id DESC 
              LIMIT 3";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $produtos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $produtos[] = $row;
    }
    
    echo json_encode($produtos);
}

// Obter todas as categorias
elseif ($_GET['action'] == 'categorias') {
    $query = "SELECT * FROM categorias WHERE ativa = 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $categorias = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $categorias[] = $row;
    }
    
    echo json_encode($categorias);
}

// Obter todos os produtos
elseif ($_GET['action'] == 'todos') {
    $categoria_id = $_GET['categoria'] ?? null;
    
    $query = "SELECT p.*, c.nome as categoria_nome 
              FROM produtos p 
              LEFT JOIN categorias c ON p.categoria_id = c.id 
              WHERE p.ativo = 1";
    
    if ($categoria_id) {
        $query .= " AND p.categoria_id = :categoria_id";
    }
    
    $query .= " ORDER BY p.nome";
    
    $stmt = $db->prepare($query);
    
    if ($categoria_id) {
        $stmt->bindParam(':categoria_id', $categoria_id);
    }
    
    $stmt->execute();
    
    $produtos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $produtos[] = $row;
    }
    
    echo json_encode($produtos);
}
?>