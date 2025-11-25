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

// Obter categorias
if ($_GET['action'] == 'get') {
    try {
        $query = "SELECT c.*, COUNT(p.id) as total_produtos 
                  FROM categorias c 
                  LEFT JOIN produtos p ON c.id = p.categoria_id AND p.ativo = 1
                  GROUP BY c.id 
                  ORDER BY c.nome";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $categorias = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $categorias[] = $row;
        }
        
        echo json_encode($categorias);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Erro ao carregar categorias: ' . $e->getMessage()]);
    }
}

// Adicionar/Editar categoria
elseif ($_POST['action'] == 'salvar') {
    try {
        $id = $_POST['id'] ?? null;
        $nome = $_POST['nome'];
        $descricao = $_POST['descricao'] ?? '';
        $ativa = isset($_POST['ativa']) ? 1 : 0;
        
        if ($id) {
            // Editar categoria existente
            $query = "UPDATE categorias SET nome = :nome, descricao = :descricao, ativa = :ativa WHERE id = :id";
        } else {
            // Nova categoria
            $query = "INSERT INTO categorias (nome, descricao, ativa) VALUES (:nome, :descricao, :ativa)";
        }
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':descricao', $descricao);
        $stmt->bindParam(':ativa', $ativa);
        
        if ($id) {
            $stmt->bindParam(':id', $id);
        }
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Categoria salva com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao salvar categoria']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// Excluir categoria
elseif ($_POST['action'] == 'excluir') {
    try {
        $id = $_POST['id'];
        
        // Verificar se existem produtos nesta categoria
        $query = "SELECT COUNT(*) as total FROM produtos WHERE categoria_id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['total'] > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir categoria com produtos vinculados!']);
            exit();
        }
        
        $query = "DELETE FROM categorias WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Categoria excluída com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir categoria']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
?>