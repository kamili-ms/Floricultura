<?php
session_start();
require_once 'conexao.php';

if ($_POST) {
    $database = new Database();
    $db = $database->getConnection();
    
    $email = $_POST['email'];
    $senha = $_POST['senha'];
    
    $query = "SELECT * FROM usuarios WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verificar senha (para admin, usar senha simples 2025)
        if ($email === 'admin@gmail.com' && $senha === '2025') {
            $_SESSION['usuario'] = $usuario;
            $_SESSION['admin'] = true;
            echo "<script>alert('Login admin realizado com sucesso!'); window.location.href='../paginas/admin.html';</script>";
            exit();
        } elseif (password_verify($senha, $usuario['senha'])) {
            $_SESSION['usuario'] = $usuario;
            echo "<script>alert('Login realizado com sucesso!'); window.location.href='../index.html';</script>";
            exit();
        } else {
            echo "<script>alert('Senha incorreta!'); window.history.back();</script>";
        }
    } else {
        echo "<script>alert('Usuário não encontrado!'); window.history.back();</script>";
    }
}
?>