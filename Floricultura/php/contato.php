<?php
session_start();
require_once 'conexao.php';

if ($_POST) {
    $database = new Database();
    $db = $database->getConnection();
    
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $telefone = $_POST['telefone'] ?? '';
    $mensagem = $_POST['mensagem'];
    
    // Validar dados
    if (empty($nome) || empty($email) || empty($mensagem)) {
        echo "<script>alert('Por favor, preencha todos os campos obrigatórios!'); window.history.back();</script>";
        exit();
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "<script>alert('Por favor, insira um email válido!'); window.history.back();</script>";
        exit();
    }
    
    // Inserir contato no banco de dados
    $query = "INSERT INTO contatos (nome, email, telefone, mensagem) VALUES (:nome, :email, :telefone, :mensagem)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':telefone', $telefone);
    $stmt->bindParam(':mensagem', $mensagem);
    
    if ($stmt->execute()) {
        echo "<script>alert('Mensagem enviada com sucesso! Entraremos em contato em breve.'); window.location.href='../index.html';</script>";
    } else {
        echo "<script>alert('Erro ao enviar mensagem. Tente novamente!'); window.history.back();</script>";
    }
}
?>
