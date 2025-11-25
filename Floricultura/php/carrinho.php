<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

// Inicializar carrinho se não existir
if (!isset($_SESSION['carrinho'])) {
    $_SESSION['carrinho'] = [];
}

$database = new Database();
$db = $database->getConnection();

// Adicionar item ao carrinho
if (isset($_POST['action']) && $_POST['action'] == 'add') {
    $produto_id = $_POST['produto_id'];
    $quantidade = $_POST['quantidade'] ?? 1;
    
    $query = "SELECT id, nome, preco, imagem FROM produtos WHERE id = :id AND ativo = 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $produto_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $produto = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verificar se já existe no carrinho
        $item_index = -1;
        foreach ($_SESSION['carrinho'] as $index => $item) {
            if ($item['id'] == $produto_id) {
                $item_index = $index;
                break;
            }
        }
        
        if ($item_index >= 0) {
            $_SESSION['carrinho'][$item_index]['quantidade'] += $quantidade;
        } else {
            $_SESSION['carrinho'][] = [
                'id' => $produto['id'],
                'nome' => $produto['nome'],
                'preco' => $produto['preco'],
                'quantidade' => $quantidade,
                'imagem' => $produto['imagem']
            ];
        }
        
        echo json_encode([
            'success' => true, 
            'message' => 'Produto adicionado ao carrinho!',
            'carrinho_count' => count($_SESSION['carrinho'])
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Produto não encontrado!']);
    }
}

// Remover item do carrinho
elseif (isset($_POST['action']) && $_POST['action'] == 'remove') {
    $produto_id = $_POST['produto_id'];
    
    foreach ($_SESSION['carrinho'] as $index => $item) {
        if ($item['id'] == $produto_id) {
            array_splice($_SESSION['carrinho'], $index, 1);
            break;
        }
    }
    
    echo json_encode([
        'success' => true, 
        'message' => 'Produto removido do carrinho!',
        'carrinho_count' => count($_SESSION['carrinho'])
    ]);
}

// Atualizar quantidade
elseif (isset($_POST['action']) && $_POST['action'] == 'update') {
    $produto_id = $_POST['produto_id'];
    $quantidade = $_POST['quantidade'];
    
    foreach ($_SESSION['carrinho'] as $index => &$item) {
        if ($item['id'] == $produto_id) {
            if ($quantidade <= 0) {
                array_splice($_SESSION['carrinho'], $index, 1);
            } else {
                $item['quantidade'] = $quantidade;
            }
            break;
        }
    }
    
    echo json_encode([
        'success' => true, 
        'message' => 'Carrinho atualizado!',
        'carrinho_count' => count($_SESSION['carrinho'])
    ]);
}

// Limpar carrinho
elseif (isset($_POST['action']) && $_POST['action'] == 'clear') {
    $_SESSION['carrinho'] = [];
    echo json_encode([
        'success' => true, 
        'message' => 'Carrinho limpo!',
        'carrinho_count' => 0
    ]);
}

// Obter carrinho
elseif (isset($_GET['action']) && $_GET['action'] == 'get') {
    echo json_encode([
        'success' => true,
        'carrinho' => $_SESSION['carrinho'],
        'total_itens' => count($_SESSION['carrinho'])
    ]);
}

// Calcular total do carrinho
elseif (isset($_GET['action']) && $_GET['action'] == 'total') {
    $total = 0;
    foreach ($_SESSION['carrinho'] as $item) {
        $total += $item['preco'] * $item['quantidade'];
    }
    echo json_encode([
        'success' => true,
        'subtotal' => $total,
        'frete' => 15.00,
        'total' => $total + 15.00
    ]);
}
?>