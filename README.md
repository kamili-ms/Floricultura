#  Floricultura — E-commerce de Flores

Sistema de e-commerce para venda de flores e arranjos, desenvolvido com **HTML, CSS e JavaScript** (Frontend) e **PHP/MySQL** (Backend).

---

##  Como Executar o Projeto

### **Pré-requisitos**
- XAMPP instalado (ou qualquer servidor com Apache + MySQL).

---

## 1.  Configuração do Banco de Dados

1. Abra o **XAMPP Control Panel** e inicie **Apache** e **MySQL**.
2. Acesse o **phpMyAdmin**:  
   http://localhost/phpmyadmin
3. Crie um novo banco de dados chamado:  
   **`floricultura`**
4. Vá até a aba **Importar**.
5. Selecione o arquivo SQL localizado em:  
   **`floricultura.sql`**
6. Clique em **Executar** para criar as tabelas e dados do sistema.

---

## 2.  Configuração dos Arquivos do Projeto

1. Coloque a pasta completa **Floricultura** dentro do diretório:

2. Verifique se a estrutura de pastas está correta para evitar erros de importação e links quebrados.

---

## 3.  Acessando o Sistema

Após configurar tudo, abra no navegador:

 http://localhost/Floricultura/index.html

---

#  Visão Geral das Páginas

##  Frontend

- **`index.html` (Home):** Página inicial com destaques e apresentação da floricultura.
- **`produtos.html` (Catálogo):** Lista de produtos disponíveis com valores e detalhes.
- **`carrinho.html` (Carrinho):** Exibe itens selecionados e permite finalizar a compra.
- **`contato.html`:** Formulário para mensagens e dúvidas.
- **`sobre.html`:** Página institucional com informações da loja.

---

#  Sistema (PHP)

- **`login.php`:** Autenticação do usuário.
- **`conexao.php`:** Arquivo essencial que estabelece a conexão do PHP com o banco de dados MySQL (host, usuário, senha e nome do banco).
- **`contato.php`:** Recebe e processa mensagens enviadas pelo formulário de contato, armazenando no sistema ou enviando para o painel administrativo.
- **`registro.php`:** Cadastro de novos usuários.
- **`pagamento.php`:** Etapa de pagamento e dados do comprador.
- **`endereco.php`:** Coleta e salva o endereço do cliente durante o processo de compra, antes da etapa de pagamento.
- **`produtos.php`:** Lista produtos do banco de dados, exibindo nome, descrição, imagem e preço. Pode incluir filtros de categoria ou busca.
- **`carrinho.php`:** Gerencia os itens adicionados ao carrinho: exibe produtos selecionados, quantidades, valores e permite atualizar ou remover itens antes de finalizar a compra.

---

#  Painel Administrativo (Administração da Loja)

###  Local do Painel

###  Login
- **Usuário:** admin@gmail.com  
- **Senha:** 2025  

### Funcionalidades
- Gerenciar produtos (inserir / editar / excluir)
- Ver pedidos de clientes
- Atualizar status dos pedidos

### Arquivos PHP do Painel

- **`admin_categorias.php`:** Gerencia categorias de produtos — cria, edita e exclui categorias que organizam o catálogo.
- **`admin_pedidos.php`:** Exibe todos os pedidos feitos pelos clientes e permite alterar o status (Ex.: Pendente → Aprovado → Enviado).
- **`admin_produtos.php`:** Gerencia os produtos da loja: adicionar novos itens, editar informações, atualizar estoque ou excluir produtos.
- **`contatos_admin.php`:** Exibe mensagens enviadas pelo formulário de contato para que o administrador possa ler e responder.

---

#  Tecnologias Utilizadas

## **Frontend**
- HTML5  
- CSS3  
- JavaScript  

## **Backend**
- PHP 7+  
- API interna simples para gestão de pedidos e carrinho  
- MySQL para persistência de dados  

