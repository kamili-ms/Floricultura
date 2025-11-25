<?php
session_start();
require_once 'conexao.php';

if ($_POST) {
    $database = new Database();
    $db = $database->getConnection();
    
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);
    $telefone = $_POST['telefone'] ?? '';
    
    // Verificar se email já existe
    $query = "SELECT id FROM usuarios WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "<script>alert('Email já cadastrado!'); window.history.back();</script>";
        exit();
    }
    
    // Inserir novo usuário
    $query = "INSERT INTO usuarios (nome, email, senha, telefone) VALUES (:nome, :email, :senha, :telefone)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':nome', $nome);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':senha', $senha);
    $stmt->bindParam(':telefone', $telefone);
    
    if ($stmt->execute()) {
        // Logar automaticamente após registro
        $usuario_id = $db->lastInsertId();
        $query = "SELECT * FROM usuarios WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $usuario_id);
        $stmt->execute();
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $_SESSION['usuario'] = $usuario;
        echo "<script>alert('Cadastro realizado com sucesso!'); window.location.href='../index.html';</script>";
    } else {
        echo "<script>alert('Erro ao cadastrar!'); window.history.back();</script>";
    }
}
?>