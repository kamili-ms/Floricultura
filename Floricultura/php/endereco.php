<?php
session_start();
require_once 'conexao.php';

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não logado']);
    exit();
}

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

// Salvar endereço
if ($_POST['action'] == 'salvar') {
    $usuario_id = $_SESSION['usuario']['id'];
    $rua = $_POST['rua'];
    $numero = $_POST['numero'];
    $complemento = $_POST['complemento'] ?? '';
    $bairro = $_POST['bairro'];
    $cidade = $_POST['cidade'];
    $estado = $_POST['estado'];
    $cep = $_POST['cep'];
    
    $query = "UPDATE usuarios SET 
              endereco_rua = :rua,
              endereco_numero = :numero,
              endereco_complemento = :complemento,
              endereco_bairro = :bairro,
              endereco_cidade = :cidade,
              endereco_estado = :estado,
              endereco_cep = :cep
              WHERE id = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':rua', $rua);
    $stmt->bindParam(':numero', $numero);
    $stmt->bindParam(':complemento', $complemento);
    $stmt->bindParam(':bairro', $bairro);
    $stmt->bindParam(':cidade', $cidade);
    $stmt->bindParam(':estado', $estado);
    $stmt->bindParam(':cep', $cep);
    $stmt->bindParam(':id', $usuario_id);
    
    if ($stmt->execute()) {
        // Atualizar dados na sessão
        $_SESSION['usuario']['endereco_rua'] = $rua;
        $_SESSION['usuario']['endereco_numero'] = $numero;
        $_SESSION['usuario']['endereco_complemento'] = $complemento;
        $_SESSION['usuario']['endereco_bairro'] = $bairro;
        $_SESSION['usuario']['endereco_cidade'] = $cidade;
        $_SESSION['usuario']['endereco_estado'] = $estado;
        $_SESSION['usuario']['endereco_cep'] = $cep;
        
        echo json_encode(['success' => true, 'message' => 'Endereço salvo com sucesso!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar endereço']);
    }
}

// Buscar endereço do usuário
elseif ($_GET['action'] == 'buscar') {
    $usuario_id = $_SESSION['usuario']['id'];
    
    $query = "SELECT endereco_rua, endereco_numero, endereco_complemento, 
                     endereco_bairro, endereco_cidade, endereco_estado, endereco_cep
              FROM usuarios WHERE id = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $usuario_id);
    $stmt->execute();
    
    $endereco = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($endereco && $endereco['endereco_rua']) {
        echo json_encode(['success' => true, 'endereco' => $endereco]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nenhum endereço cadastrado']);
    }
}

// Buscar CEP via API
elseif ($_GET['action'] == 'buscar_cep') {
    $cep = preg_replace('/[^0-9]/', '', $_GET['cep']);
    
    if (strlen($cep) === 8) {
        $url = "https://viacep.com.br/ws/{$cep}/json/";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        $dados = json_decode($response, true);
        
        if (!isset($dados['erro'])) {
            echo json_encode([
                'success' => true,
                'rua' => $dados['logradouro'],
                'bairro' => $dados['bairro'],
                'cidade' => $dados['localidade'],
                'estado' => $dados['uf']
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'CEP não encontrado']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'CEP inválido']);
    }
}
?>