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

// Obter pedidos
if ($_GET['action'] == 'get') {
    $query = "SELECT p.*, u.nome as cliente_nome, u.email as cliente_email 
              FROM pedidos p 
              LEFT JOIN usuarios u ON p.usuario_id = u.id 
              ORDER BY p.data_pedido DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $pedidos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $pedidos[] = $row;
    }
    
    echo json_encode($pedidos);
}

// Obter detalhes do pedido
elseif ($_GET['action'] == 'detalhes') {
    $pedido_id = $_GET['pedido_id'];
    
    // Informações do pedido
    $query = "SELECT p.*, u.nome as cliente_nome, u.email as cliente_email, 
                     u.telefone as cliente_telefone
              FROM pedidos p 
              LEFT JOIN usuarios u ON p.usuario_id = u.id 
              WHERE p.id = :pedido_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':pedido_id', $pedido_id);
    $stmt->execute();
    $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Itens do pedido
    $query = "SELECT pi.*, pr.nome as produto_nome, pr.imagem as produto_imagem
              FROM pedido_itens pi 
              LEFT JOIN produtos pr ON pi.produto_id = pr.id 
              WHERE pi.pedido_id = :pedido_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':pedido_id', $pedido_id);
    $stmt->execute();
    $itens = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $itens[] = $row;
    }
    
    echo json_encode(['pedido' => $pedido, 'itens' => $itens]);
}

// Atualizar status do pedido
elseif ($_POST['action'] == 'atualizar_status') {
    $pedido_id = $_POST['pedido_id'];
    $status = $_POST['status'];
    
    $query = "UPDATE pedidos SET status = :status WHERE id = :pedido_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':pedido_id', $pedido_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Status atualizado com sucesso!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar status']);
    }
}

// Obter estatísticas
elseif ($_GET['action'] == 'estatisticas') {
    // Total de pedidos
    $query = "SELECT COUNT(*) as total_pedidos FROM pedidos";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $total_pedidos = $stmt->fetch(PDO::FETCH_ASSOC)['total_pedidos'];
    
    // Pedidos pendentes
    $query = "SELECT COUNT(*) as pedidos_pendentes FROM pedidos WHERE status = 'pendente'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $pedidos_pendentes = $stmt->fetch(PDO::FETCH_ASSOC)['pedidos_pendentes'];
    
    // Valor total vendido
    $query = "SELECT COALESCE(SUM(total), 0) as total_vendido FROM pedidos WHERE status IN ('pago', 'processando', 'enviado', 'entregue')";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $total_vendido = $stmt->fetch(PDO::FETCH_ASSOC)['total_vendido'];
    
    echo json_encode([
        'total_pedidos' => $total_pedidos,
        'pedidos_pendentes' => $pedidos_pendentes,
        'total_vendido' => $total_vendido
    ]);
}
?>