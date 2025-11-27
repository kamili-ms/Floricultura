-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 24/11/2025 às 00:25
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `floricultura`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `descricao` text DEFAULT NULL,
  `ativa` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `categorias`
--

INSERT INTO `categorias` (`id`, `nome`, `descricao`, `ativa`) VALUES
(1, 'Rosas', 'Buquês de rosas em diversas cores e tamanhos', 1),
(2, 'Orquídeas', 'Orquídeas elegantes e sofisticadas', 1),
(3, 'Girassóis', 'Girassóis vibrantes que trazem alegria', 1),
(4, 'Lírios', 'Lírios puros e delicados', 1),
(5, 'Flores do Campo', 'Flores campestres naturais e charmosas', 1),
(6, 'Especiais', 'Flores especiais para ocasiões únicas', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `contatos`
--

CREATE TABLE `contatos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `mensagem` text NOT NULL,
  `data_contato` timestamp NOT NULL DEFAULT current_timestamp(),
  `lido` tinyint(1) DEFAULT 0,
  `respondido` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `numero_pedido` varchar(20) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `frete` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pendente','pago','processando','enviado','entregue','cancelado') DEFAULT 'pendente',
  `metodo_pagamento` enum('cartao','pix','boleto') DEFAULT NULL,
  `endereco_entrega` text DEFAULT NULL,
  `data_pedido` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedido_itens`
--

CREATE TABLE `pedido_itens` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `produto_id` int(11) DEFAULT NULL,
  `quantidade` int(11) NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `estoque` int(11) NOT NULL DEFAULT 0,
  `categoria_id` int(11) DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome`, `descricao`, `preco`, `estoque`, `categoria_id`, `imagem`, `ativo`, `data_cadastro`) VALUES
(1, 'Buquê Rosas Vermelhas', '12 rosas vermelhas frescas, perfeitas para declarações de amor.', 129.90, 8, 1, 'buque.rosasvermelhas.png', 1, '2025-11-23 21:40:14'),
(2, 'Buquê Dália', 'Dálias coloridas e vibrantes, ideais para decorar qualquer ambiente.', 79.90, 12, 5, 'buque.dalia.png', 1, '2025-11-23 21:40:14'),
(3, 'Buquê Girassóis', 'Girassóis amarelos vibrantes que trazem alegria e energia positiva.', 69.90, 15, 3, 'buque.girassois.png', 1, '2025-11-23 21:40:14'),
(4, 'Buquê Jasmim', 'Jasmim branco com aroma delicado e envolvente.', 89.90, 10, 5, 'buque.jasmin.png', 1, '2025-11-23 21:40:14'),
(5, 'Buquê Lírios', 'Lírios delicados em tons pastéis, perfeitos para arranjos românticos.', 75.90, 14, 4, 'buque.lirios.png', 1, '2025-11-23 21:40:14'),
(6, 'Buquê Lírios Brancos', 'Lírios brancos puros, simbolizando pureza e elegância.', 82.90, 9, 4, 'buque.liriosbrancos.png', 1, '2025-11-23 21:40:14'),
(7, 'Buquê Orquídea Azul', 'Orquídeas azuis elegantes e sofisticadas para ocasiões especiais.', 139.90, 6, 2, 'buque.orquidea.png', 1, '2025-11-23 21:40:14'),
(8, 'Buquê Orquídea Roxa', 'Orquídeas roxas majestosas, representando admiração e respeito.', 149.90, 5, 2, 'buque.orquidearoxa.png', 1, '2025-11-23 21:40:14'),
(9, 'Buquê Peônia', 'Peônias rosas românticas, florescem com beleza e delicadeza.', 119.90, 7, 6, 'buque.peonia.png', 1, '2025-11-23 21:40:14'),
(10, 'Buquê Rosas Azuis', 'Rosas azuis misteriosas e únicas, para presentear alguém especial.', 99.90, 4, 1, 'buque.rosasazul.png', 1, '2025-11-23 21:40:14'),
(11, 'Buquê Rosas Brancas', 'Rosas brancas puras, simbolizando inocência e novos começos.', 94.90, 11, 1, 'buque.rosasbrancas.png', 1, '2025-11-23 21:40:14'),
(12, 'Buquê Copo de Leite', 'Copo de leite branco puro e elegante, perfeito para casamentos.', 89.90, 15, 6, 'buque.copodeleite.png', 1, '2025-11-23 21:40:14'),
(13, 'Buquê Tulipas Azuis', 'Tulipas azuis raras e elegantes, representando tranquilidade e paz.', 109.90, 8, 6, 'buque.tulipasazul.png', 1, '2025-11-23 21:40:14');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` text DEFAULT NULL,
  `cidade` varchar(50) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `tipo` enum('cliente','admin') DEFAULT 'cliente',
  `endereco_rua` varchar(255) DEFAULT NULL,
  `endereco_numero` varchar(20) DEFAULT NULL,
  `endereco_complemento` varchar(100) DEFAULT NULL,
  `endereco_bairro` varchar(100) DEFAULT NULL,
  `endereco_cidade` varchar(100) DEFAULT NULL,
  `endereco_estado` varchar(2) DEFAULT NULL,
  `endereco_cep` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `telefone`, `endereco`, `cidade`, `estado`, `cep`, `data_cadastro`, `tipo`, `endereco_rua`, `endereco_numero`, `endereco_complemento`, `endereco_bairro`, `endereco_cidade`, `endereco_estado`, `endereco_cep`) VALUES
(1, 'Administrador', 'admin@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, NULL, NULL, NULL, '2025-11-23 21:40:14', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'leticia', 'leticia@gmail.com', '$2y$10$E026KwgTlaRx2VjmZafUVe8f8P65iyl712CPDn5eJvDscJm.4tQLu', '112345678', NULL, NULL, NULL, NULL, '2025-11-23 22:11:37', 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `contatos`
--
ALTER TABLE `contatos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_pedido` (`numero_pedido`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `pedido_itens`
--
ALTER TABLE `pedido_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `produto_id` (`produto_id`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `contatos`
--
ALTER TABLE `contatos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pedido_itens`
--
ALTER TABLE `pedido_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `pedido_itens`
--
ALTER TABLE `pedido_itens`
  ADD CONSTRAINT `pedido_itens_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_itens_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`);

--
-- Restrições para tabelas `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `produtos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
