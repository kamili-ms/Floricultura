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

// Obter produtos
if ($_GET['action'] == 'get') {
    try {
        $query = "SELECT p.*, c.nome as categoria_nome 
                  FROM produtos p 
                  LEFT JOIN categorias c ON p.categoria_id = c.id 
                  ORDER BY p.id";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $produtos = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $produtos[] = $row;
        }
        
        echo json_encode($produtos);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Erro ao carregar produtos: ' . $e->getMessage()]);
    }
}

// Obter categorias para o select
elseif ($_GET['action'] == 'categorias') {
    try {
        $query = "SELECT * FROM categorias WHERE ativa = 1 ORDER BY nome";
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

// Adicionar/Editar produto
elseif ($_POST['action'] == 'salvar') {
    try {
        $id = $_POST['id'] ?? null;
        $nome = $_POST['nome'];
        $descricao = $_POST['descricao'] ?? '';
        $preco = $_POST['preco'];
        $estoque = $_POST['estoque'];
        $categoria_id = $_POST['categoria_id'];
        $imagem = $_POST['imagem'] ?? '';
        $ativo = isset($_POST['ativo']) ? 1 : 0;
        
        if ($id) {
            // Editar produto existente
            $query = "UPDATE produtos SET nome = :nome, descricao = :descricao, preco = :preco, 
                      estoque = :estoque, categoria_id = :categoria_id, imagem = :imagem, ativo = :ativo 
                      WHERE id = :id";
        } else {
            // Novo produto
            $query = "INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id, imagem, ativo) 
                      VALUES (:nome, :descricao, :preco, :estoque, :categoria_id, :imagem, :ativo)";
        }
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':descricao', $descricao);
        $stmt->bindParam(':preco', $preco);
        $stmt->bindParam(':estoque', $estoque);
        $stmt->bindParam(':categoria_id', $categoria_id);
        $stmt->bindParam(':imagem', $imagem);
        $stmt->bindParam(':ativo', $ativo);
        
        if ($id) {
            $stmt->bindParam(':id', $id);
        }
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Produto salvo com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao salvar produto']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}

// Excluir produto
elseif ($_POST['action'] == 'excluir') {
    try {
        $id = $_POST['id'];
        
        $query = "DELETE FROM produtos WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Produto excluído com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir produto']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    }
}
?>