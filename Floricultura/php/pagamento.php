<?php
session_start();
require_once 'conexao.php';

header('Content-Type: application/json');

if (!isset($_SESSION['usuario']) || !isset($_SESSION['carrinho']) || empty($_SESSION['carrinho'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não logado ou carrinho vazio!']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    $db->beginTransaction();
    
    // Calcular totais do carrinho da sessão
$subtotal = 0;
foreach ($_SESSION['carrinho'] as $item) {
    $subtotal += $item['preco'] * $item['quantidade'];
}
$frete = 15.00; // Frete fixo
$total = $subtotal + $frete;
    
    // Gerar número do pedido
    $numero_pedido = 'PED' . date('YmdHis');
    
    // Criar pedido
    $query = "INSERT INTO pedidos (numero_pedido, usuario_id, subtotal, frete, total, metodo_pagamento, endereco_entrega, status) 
              VALUES (:numero_pedido, :usuario_id, :subtotal, :frete, :total, :metodo_pagamento, :endereco_entrega, 'pendente')";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':numero_pedido', $numero_pedido);
    $stmt->bindParam(':usuario_id', $_SESSION['usuario']['id']);
    $stmt->bindParam(':subtotal', $subtotal);
    $stmt->bindParam(':frete', $frete);
    $stmt->bindParam(':total', $total);
    $stmt->bindParam(':metodo_pagamento', $_POST['metodo_pagamento']);
    $stmt->bindParam(':endereco_entrega', $_POST['endereco_entrega']);
    $stmt->execute();
    
    $pedido_id = $db->lastInsertId();
    
    // Adicionar itens do pedido e atualizar estoque
    foreach ($_SESSION['carrinho'] as $item) {
        // Inserir item do pedido
        $subtotal_item = $item['preco'] * $item['quantidade'];
        $query = "INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario, subtotal) 
                  VALUES (:pedido_id, :produto_id, :quantidade, :preco_unitario, :subtotal)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':pedido_id', $pedido_id);
        $stmt->bindParam(':produto_id', $item['id']);
        $stmt->bindParam(':quantidade', $item['quantidade']);
        $stmt->bindParam(':preco_unitario', $item['preco']);
        $stmt->bindParam(':subtotal', $subtotal_item);
        $stmt->execute();
        
        // Atualizar estoque
        $query = "UPDATE produtos SET estoque = estoque - :quantidade WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':quantidade', $item['quantidade']);
        $stmt->bindParam(':id', $item['id']);
        $stmt->execute();
    }
    
    $db->commit();
    
    // Limpar carrinho após pedido concluído
    $_SESSION['carrinho'] = [];
    
    echo json_encode([
        'success' => true, 
        'message' => 'Pedido realizado com sucesso!', 
        'numero_pedido' => $numero_pedido,
        'pedido_id' => $pedido_id,
        'total' => $total
    ]);
    
} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(['success' => false, 'message' => 'Erro ao processar pedido: ' . $e->getMessage()]);
}
?>