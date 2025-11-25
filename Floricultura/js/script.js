// Sistema de Gerenciamento da Floricultura

class FloriculturaApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.verificarEstadoUsuario();
        this.atualizarContadorCarrinho();
        this.inicializarPagamento();
    }

    setupEventListeners() {
        // Event listeners para adicionar ao carrinho
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                this.adicionarAoCarrinho(e);
            }
        });

        // Smooth scroll para links internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    inicializarPagamento() {
        // Verificar se estamos na página de pagamento
        if (document.getElementById('pagamentoSection')) {
            this.carrinhoPagamento = [];
            this.enderecoSalvo = false;
            this.totalPedido = 0;
            this.countdownInterval = null;

            this.carregarCarrinhoPagamento();
            this.carregarEnderecoSalvo();
            this.gerarNumeroPedido();
            this.configurarFormatacaoInputsPagamento();
        }
    }

    configurarFormatacaoInputsPagamento() {
        const cepInput = document.getElementById('cep');
        const numeroCartaoInput = document.getElementById('numeroCartao');
        const validadeCartaoInput = document.getElementById('validadeCartao');

        if (cepInput) {
            cepInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 5) {
                    value = value.substring(0,5) + '-' + value.substring(5,8);
                }
                e.target.value = value;
            });
        }

        if (numeroCartaoInput) {
            numeroCartaoInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value.substring(0, 19);
            });
        }

        if (validadeCartaoInput) {
            validadeCartaoInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 2) {
                    value = value.substring(0,2) + '/' + value.substring(2,4);
                }
                e.target.value = value;
            });
        }

        // Event listeners para métodos de pagamento
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.mostrarFormaPagamento(e.target.value);
            });
        });
    }

    async carregarCarrinhoPagamento() {
        try {
            const response = await fetch('../php/carrinho.php?action=get');
            const data = await response.json();
            
            if (data.success) {
                this.carrinhoPagamento = data.carrinho;
                this.exibirItensPedido();
                this.calcularTotaisPagamento();
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            this.mostrarNotificacao('Erro ao carregar carrinho', 'error');
        }
    }

    exibirItensPedido() {
        const container = document.getElementById('itensPedido');
        
        if (!container) return;

        if (this.carrinhoPagamento.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhum item no pedido</p>';
            return;
        }

        container.innerHTML = this.carrinhoPagamento.map(item => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <small class="fw-bold">${item.nome}</small>
                    <br>
                    <small class="text-muted">${item.quantidade}x R$ ${parseFloat(item.preco).toFixed(2)}</small>
                </div>
                <small>R$ ${(item.quantidade * item.preco).toFixed(2)}</small>
            </div>
        `).join('');
    }

    calcularTotaisPagamento() {
        const subtotal = this.carrinhoPagamento.reduce((total, item) => total + (item.preco * item.quantidade), 0);
        const frete = 15.00;
        this.totalPedido = subtotal + frete;

        const resumoSubtotal = document.getElementById('resumoSubtotal');
        const resumoFrete = document.getElementById('resumoFrete');
        const resumoTotal = document.getElementById('resumoTotal');

        if (resumoSubtotal) resumoSubtotal.textContent = `R$ ${subtotal.toFixed(2)}`;
        if (resumoFrete) resumoFrete.textContent = `R$ ${frete.toFixed(2)}`;
        if (resumoTotal) resumoTotal.textContent = `R$ ${this.totalPedido.toFixed(2)}`;

        // Calcular parcelas
        const parcela1 = document.getElementById('parcela1');
        const parcela2 = document.getElementById('parcela2');
        const parcela3 = document.getElementById('parcela3');
        
        if (parcela1) parcela1.textContent = this.totalPedido.toFixed(2);
        if (parcela2) parcela2.textContent = (this.totalPedido / 2).toFixed(2);
        if (parcela3) parcela3.textContent = (this.totalPedido / 3).toFixed(2);

        // Atualizar valor do boleto
        const valorBoleto = document.getElementById('valorBoleto');
        if (valorBoleto) valorBoleto.value = `R$ ${this.totalPedido.toFixed(2)}`;
    }

    gerarNumeroPedido() {
        const numero = 'PED' + new Date().getTime().toString().slice(-8);
        const numeroPedidoElement = document.getElementById('numeroPedido');
        if (numeroPedidoElement) {
            numeroPedidoElement.textContent = numero;
            
            // Gerar código PIX baseado no número do pedido
            const codigoPix = document.getElementById('codigoPix');
            if (codigoPix) {
                codigoPix.textContent = `00020126580014br.gov.bcb.pix0136${numero}5204000053039865406${this.totalPedido.toFixed(2)}5802BR5900FLORICULTURA6008SAO PAULO62070503***6304`;
            }
            
            // Calcular vencimento do boleto (3 dias úteis)
            const vencimento = new Date();
            vencimento.setDate(vencimento.getDate() + 3);
            const vencimentoBoleto = document.getElementById('vencimentoBoleto');
            if (vencimentoBoleto) {
                vencimentoBoleto.value = vencimento.toLocaleDateString('pt-BR');
            }
        }
    }

    mostrarFormaPagamento(tipo) {
        // Esconder todas as seções
        document.querySelectorAll('.payment-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar a seção selecionada
        const section = document.getElementById(tipo + 'Section');
        if (section) {
            section.classList.add('active');
        }
        
        // Gerar QR Code para PIX
        if (tipo === 'pix') {
            this.gerarQrCodePix();
        }
    }

    gerarQrCodePix() {
        const qrCodeDiv = document.getElementById('qrCodePix');
        if (qrCodeDiv) {
            qrCodeDiv.innerHTML = `
                <div class="text-center">
                    <div style="width: 180px; height: 180px; background: #f8f9fa; border: 2px solid #28a745; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <div style="font-size: 10px; color: #28a745;">
                            <div>■ □ ■ □ ■ □ ■</div>
                            <div>□ ■ □ ■ □ ■ □</div>
                            <div>■ □ ■ □ ■ □ ■</div>
                            <div>□ ■ □ ■ □ ■ □</div>
                            <div>■ □ ■ □ ■ □ ■</div>
                            <div>□ ■ □ ■ □ ■ □</div>
                            <div>■ □ ■ □ ■ □ ■</div>
                        </div>
                    </div>
                    <small class="text-muted mt-2 d-block">QR Code PIX</small>
                </div>
            `;
        }
    }

    async carregarEnderecoSalvo() {
        try {
            const response = await fetch('../php/endereco.php?action=buscar');
            const data = await response.json();
            
            if (data.success && data.endereco) {
                const campos = ['cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado'];
                campos.forEach(campo => {
                    const element = document.getElementById(campo);
                    if (element) {
                        element.value = data.endereco[`endereco_${campo}`] || '';
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao carregar endereço:', error);
        }
    }

    async adicionarAoCarrinho(event) {
        const button = event.target.classList.contains('add-to-cart') ? 
            event.target : event.target.closest('.add-to-cart');
        
        const productCard = button.closest('.product-card');
        const productId = productCard.dataset.productId;

        try {
            const formData = new FormData();
            formData.append('action', 'add');
            formData.append('produto_id', productId);
            formData.append('quantidade', 1);

            const response = await fetch('php/carrinho.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.mostrarNotificacao(result.message, 'success');
                this.atualizarContadorCarrinho();
            } else {
                this.mostrarNotificacao(result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            this.mostrarNotificacao('Erro ao adicionar produto ao carrinho', 'error');
        }
    }

    async atualizarContadorCarrinho() {
        try {
            const response = await fetch('php/carrinho.php?action=get');
            const data = await response.json();
            
            if (data.success) {
                const cartCounts = document.querySelectorAll('.cart-count');
                cartCounts.forEach(cartCount => {
                    cartCount.textContent = data.total_itens;
                    cartCount.style.display = data.total_itens > 0 ? 'inline' : 'none';
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar contador do carrinho:', error);
        }
    }

    verificarEstadoUsuario() {
        const userStatus = document.getElementById('userStatus');
        if (userStatus) {
            const usuarioLogado = localStorage.getItem('usuarioLogado');
            if (usuarioLogado) {
                userStatus.textContent = JSON.parse(usuarioLogado).nome;
            }
        }
    }

    mostrarNotificacao(mensagem, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        notification.innerHTML = `
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    filtrarProdutos(termo, categoria) {
        const produtos = document.querySelectorAll('.product-card');
        let visiveis = 0;

        produtos.forEach(produto => {
            const nome = produto.querySelector('.card-title').textContent.toLowerCase();
            const descricao = produto.querySelector('.card-text').textContent.toLowerCase();
            const produtoCategoria = produto.dataset.category;

            const correspondeTermo = nome.includes(termo) || descricao.includes(termo);
            const correspondeCategoria = !categoria || categoria === 'all' || produtoCategoria === categoria;

            if (correspondeTermo && correspondeCategoria) {
                produto.style.display = 'block';
                visiveis++;
            } else {
                produto.style.display = 'none';
            }
        });

        const contador = document.getElementById('productCount');
        if (contador) {
            contador.textContent = visiveis;
        }
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    window.floriculturaApp = new FloriculturaApp();
});

// ===== FUNÇÕES GLOBAIS PARA PAGAMENTO =====

async function buscarCEP() {
    const cepInput = document.getElementById('cep');
    if (!cepInput) return;
    
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        alert('CEP inválido!');
        return;
    }

    try {
        const response = await fetch(`../php/endereco.php?action=buscar_cep&cep=${cep}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('rua').value = data.rua;
            document.getElementById('bairro').value = data.bairro;
            document.getElementById('cidade').value = data.cidade;
            document.getElementById('estado').value = data.estado;
            document.getElementById('numero').focus();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP. Tente novamente.');
    }
}

async function salvarEndereco() {
    const form = document.getElementById('enderecoForm');
    if (!form) return;

    const formData = new FormData(form);
    formData.append('action', 'salvar');

    try {
        const response = await fetch('../php/endereco.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            if (window.floriculturaApp) {
                window.floriculturaApp.enderecoSalvo = true;
            }
            
            const enderecoCompleto = `
                ${formData.get('rua')}, ${formData.get('numero')}
                ${formData.get('complemento') ? ' - ' + formData.get('complemento') : ''}
                <br>${formData.get('bairro')}
                <br>${formData.get('cidade')} - ${formData.get('estado')}
                <br>CEP: ${formData.get('cep')}
            `;
            
            document.getElementById('enderecoCompleto').innerHTML = enderecoCompleto;
            document.getElementById('enderecoSalvo').style.display = 'block';
            document.getElementById('pagamentoSection').style.display = 'block';
            document.getElementById('confirmPayment').disabled = false;
            
            alert('Endereço salvo com sucesso!');
        } else {
            alert('Erro: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao salvar endereço:', error);
        alert('Erro ao salvar endereço.');
    }
}

function copiarCodigoPix() {
    const codigoPix = document.getElementById('codigoPix');
    if (!codigoPix) return;
    
    navigator.clipboard.writeText(codigoPix.textContent).then(() => {
        alert('Código PIX copiado para a área de transferência!');
    });
}

function copiarCodigoBoleto() {
    const codigoBoleto = document.getElementById('codigoBoleto');
    if (!codigoBoleto) return;
    
    navigator.clipboard.writeText(codigoBoleto.value).then(() => {
        alert('Código do boleto copiado para a área de transferência!');
    });
}

async function verificarPagamentoPix() {
    const confirmacao = confirm('Você já efetuou o pagamento PIX? Esta ação irá confirmar seu pedido.');
    
    if (confirmacao) {
        try {
            const formData = new FormData();
            formData.append('metodo_pagamento', 'pix');
            formData.append('status_pagamento', 'confirmado');

            const response = await fetch('../php/pagamento.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                alert(`Pagamento PIX confirmado com sucesso!\nNúmero do pedido: ${result.numero_pedido}`);
                limparCarrinho();
                window.location.href = '../index.html';
            } else {
                alert('Erro: ' + result.message);
            }
        } catch (error) {
            console.error('Erro ao confirmar pagamento PIX:', error);
            alert('Erro ao confirmar pagamento PIX.');
        }
    }
}

async function verificarPagamentoBoleto() {
    const confirmacao = confirm('Você já efetuou o pagamento do boleto? O pedido será processado após a confirmação do banco (até 2 dias úteis).');
    
    if (confirmacao) {
        try {
            const formData = new FormData();
            formData.append('metodo_pagamento', 'boleto');
            formData.append('status_pagamento', 'aguardando');

            const response = await fetch('../php/pagamento.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                alert(`Boleto gerado com sucesso!\nNúmero do pedido: ${result.numero_pedido}\n\nAcompanhe o status do pagamento em seu e-mail.`);
                limparCarrinho();
                window.location.href = '../index.html';
            } else {
                alert('Erro: ' + result.message);
            }
        } catch (error) {
            console.error('Erro ao gerar boleto:', error);
            alert('Erro ao gerar boleto.');
        }
    }
}

async function processarPagamento() {
    if (!window.floriculturaApp?.enderecoSalvo) {
        alert('Por favor, salve o endereço primeiro!');
        return;
    }

    if (window.floriculturaApp?.carrinhoPagamento?.length === 0) {
        alert('Carrinho vazio!');
        return;
    }

    const metodoPagamento = document.querySelector('input[name="paymentMethod"]:checked');
    if (!metodoPagamento) {
        alert('Selecione um método de pagamento!');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('metodo_pagamento', metodoPagamento.value);

        if (metodoPagamento.value === 'cartao') {
            if (!validarCartao()) {
                return;
            }
            formData.append('numero_cartao', document.getElementById('numeroCartao').value);
            formData.append('nome_cartao', document.getElementById('nomeCartao').value);
            formData.append('validade_cartao', document.getElementById('validadeCartao').value);
            formData.append('cvv_cartao', document.getElementById('cvvCartao').value);
            formData.append('parcelas', document.getElementById('parcelasCartao').value);
            formData.append('status_pagamento', 'confirmado');
        }

        const response = await fetch('../php/pagamento.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            let mensagem = `Pagamento processado com sucesso!\nNúmero do pedido: ${result.numero_pedido}`;
            
            if (metodoPagamento.value === 'boleto') {
                mensagem += '\n\nBoleto gerado! Verifique seu e-mail para mais instruções.';
            } else if (metodoPagamento.value === 'pix') {
                mensagem += '\n\nPagamento PIX confirmado!';
            }
            
            alert(mensagem);
            limparCarrinho();
            window.location.href = '../index.html';
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        alert('Erro ao processar pagamento.');
    }
}

function validarCartao() {
    const numeroCartao = document.getElementById('numeroCartao');
    const nomeCartao = document.getElementById('nomeCartao');
    const validadeCartao = document.getElementById('validadeCartao');
    const cvvCartao = document.getElementById('cvvCartao');
    const parcelas = document.getElementById('parcelasCartao');

    if (!numeroCartao || !nomeCartao || !validadeCartao || !cvvCartao || !parcelas) {
        return false;
    }

    const numero = numeroCartao.value.replace(/\s/g, '');
    const nome = nomeCartao.value;
    const validade = validadeCartao.value;
    const cvv = cvvCartao.value;
    const parcelaValue = parcelas.value;

    if (numero.length !== 16) {
        alert('Número do cartão inválido!');
        return false;
    }

    if (nome.trim().length < 3) {
        alert('Nome no cartão inválido!');
        return false;
    }

    if (!validade.match(/^\d{2}\/\d{2}$/)) {
        alert('Validade do cartão inválida! Use o formato MM/AA');
        return false;
    }

    if (cvv.length !== 3) {
        alert('CVV inválido!');
        return false;
    }

    if (!parcelaValue) {
        alert('Selecione o número de parcelas!');
        return false;
    }

    return true;
}

async function limparCarrinho() {
    try {
        await fetch('../php/carrinho.php?action=limpar', {
            method: 'POST'
        });
    } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
    }
}

// Funções globais para uso em outros arquivos
async function adicionarAoCarrinho(produtoId) {
    try {
        const formData = new FormData();
        formData.append('action', 'add');
        formData.append('produto_id', produtoId);
        formData.append('quantidade', 1);

        const response = await fetch('php/carrinho.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            if (window.floriculturaApp) {
                window.floriculturaApp.atualizarContadorCarrinho();
            }
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        alert('Erro ao adicionar produto ao carrinho');
    }
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}

// Funções para gerenciar contatos no admin
async function carregarContatos() {
    try {
        const response = await fetch('../php/contatos_admin.php?action=get');
        const contatos = await response.json();
        
        const table = document.getElementById('contatosTable');
        table.innerHTML = contatos.map(contato => `
            <tr class="${contato.lido ? '' : 'table-warning'}">
                <td>${new Date(contato.data_contato).toLocaleDateString('pt-BR')}</td>
                <td>
                    <strong>${contato.nome}</strong>
                    ${!contato.lido ? '<span class="badge bg-danger ms-1">Novo</span>' : ''}
                </td>
                <td>${contato.email}</td>
                <td>${contato.telefone || 'Não informado'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="verMensagem(${contato.id}, '${contato.mensagem}')">
                        <i class="bi bi-eye"></i> Ver
                    </button>
                </td>
                <td>
                    ${contato.respondido ? 
                        '<span class="badge bg-success">Respondido</span>' : 
                        '<span class="badge bg-warning">Pendente</span>'
                    }
                </td>
                <td>
                    ${!contato.lido ? `
                        <button class="btn btn-sm btn-outline-success" onclick="marcarComoLido(${contato.id})">
                            <i class="bi bi-check"></i> Lido
                        </button>
                    ` : ''}
                    ${!contato.respondido ? `
                        <button class="btn btn-sm btn-outline-primary" onclick="marcarComoRespondido(${contato.id})">
                            <i class="bi bi-reply"></i> Respondido
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirContato(${contato.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        atualizarContadorNaoLidos();
    } catch (error) {
        console.error('Erro ao carregar contatos:', error);
    }
}

async function atualizarContadorNaoLidos() {
    try {
        const response = await fetch('../php/contatos_admin.php?action=nao_lidos');
        const data = await response.json();
        
        document.getElementById('contatosNaoLidos').textContent = `${data.nao_lidos} não lidos`;
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
    }
}

function verMensagem(id, mensagem) {
    alert(`Mensagem do contato #${id}:\n\n${mensagem}`);
}

async function marcarComoLido(contatoId) {
    try {
        const formData = new FormData();
        formData.append('action', 'marcar_lido');
        formData.append('contato_id', contatoId);

        const response = await fetch('../php/contatos_admin.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            carregarContatos();
        }
    } catch (error) {
        console.error('Erro ao marcar como lido:', error);
    }
}

async function marcarComoRespondido(contatoId) {
    try {
        const formData = new FormData();
        formData.append('action', 'marcar_respondido');
        formData.append('contato_id', contatoId);

        const response = await fetch('../php/contatos_admin.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            carregarContatos();
        }
    } catch (error) {
        console.error('Erro ao marcar como respondido:', error);
    }
}

async function excluirContato(contatoId) {
    if (confirm('Tem certeza que deseja excluir este contato?')) {
        try {
            const formData = new FormData();
            formData.append('action', 'excluir');
            formData.append('contato_id', contatoId);

            const response = await fetch('../php/contatos_admin.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                carregarContatos();
            }
        } catch (error) {
            console.error('Erro ao excluir contato:', error);
        }
    }
}

// Funções para gerenciar pedidos
async function carregarPedidos() {
    try {
        const response = await fetch('../php/admin_pedidos.php?action=get');
        const pedidos = await response.json();
        
        const tabela = document.getElementById('tabelaPedidos');
        const semPedidos = document.getElementById('semPedidos');
        
        if (pedidos.length === 0) {
            tabela.innerHTML = '';
            semPedidos.style.display = 'block';
            return;
        }
        
        semPedidos.style.display = 'none';
        tabela.innerHTML = pedidos.map(pedido => `
            <tr>
                <td>
                    <strong>${pedido.numero_pedido}</strong>
                    <br>
                    <small class="text-muted">${pedido.metodo_pagamento}</small>
                </td>
                <td>
                    <strong>${pedido.cliente_nome || 'Cliente'}</strong>
                    <br>
                    <small class="text-muted">${pedido.cliente_email || ''}</small>
                </td>
                <td>${new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</td>
                <td>
                    <strong>R$ ${parseFloat(pedido.total).toFixed(2)}</strong>
                    <br>
                    <small class="text-muted">Frete: R$ ${parseFloat(pedido.frete).toFixed(2)}</small>
                </td>
                <td>
                    <select class="form-select form-select-sm" onchange="atualizarStatusPedido(${pedido.id}, this.value)">
                        <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="pago" ${pedido.status === 'pago' ? 'selected' : ''}>Pago</option>
                        <option value="processando" ${pedido.status === 'processando' ? 'selected' : ''}>Processando</option>
                        <option value="enviado" ${pedido.status === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
                        <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                    <small class="badge bg-${getStatusColor(pedido.status)} mt-1">${getStatusText(pedido.status)}</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="verDetalhesPedido(${pedido.id})">
                        <i class="bi bi-eye"></i> Detalhes
                    </button>
                </td>
            </tr>
        `).join('');
        
        await carregarEstatisticasPedidos();
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

async function carregarEstatisticasPedidos() {
    try {
        const response = await fetch('../php/admin_pedidos.php?action=estatisticas');
        const stats = await response.json();
        
        document.getElementById('totalPedidos').textContent = stats.total_pedidos;
        document.getElementById('pedidosPendentes').textContent = stats.pedidos_pendentes;
        document.getElementById('totalVendido').textContent = `R$ ${parseFloat(stats.total_vendido).toFixed(2)}`;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

function getStatusColor(status) {
    const colors = {
        'pendente': 'warning',
        'pago': 'success',
        'processando': 'info',
        'enviado': 'primary',
        'entregue': 'success',
        'cancelado': 'danger'
    };
    return colors[status] || 'secondary';
}

function getStatusText(status) {
    const texts = {
        'pendente': 'Pendente',
        'pago': 'Pago',
        'processando': 'Processando',
        'enviado': 'Enviado',
        'entregue': 'Entregue',
        'cancelado': 'Cancelado'
    };
    return texts[status] || status;
}

async function atualizarStatusPedido(pedidoId, novoStatus) {
    try {
        const formData = new FormData();
        formData.append('action', 'atualizar_status');
        formData.append('pedido_id', pedidoId);
        formData.append('status', novoStatus);

        const response = await fetch('../php/admin_pedidos.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            mostrarNotificacao('Status do pedido atualizado com sucesso!', 'success');
            carregarPedidos();
        } else {
            mostrarNotificacao('Erro ao atualizar status: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        mostrarNotificacao('Erro ao atualizar status do pedido', 'error');
    }
}

async function verDetalhesPedido(pedidoId) {
    try {
        const response = await fetch(`../php/admin_pedidos.php?action=detalhes&pedido_id=${pedidoId}`);
        const data = await response.json();
        
        const pedido = data.pedido;
        const itens = data.itens;
        
        let detalhesHTML = `
            <h5>Detalhes do Pedido: ${pedido.numero_pedido}</h5>
            <div class="row mt-3">
                <div class="col-md-6">
                    <h6>Informações do Cliente:</h6>
                    <p><strong>Nome:</strong> ${pedido.cliente_nome || 'Não informado'}</p>
                    <p><strong>Email:</strong> ${pedido.cliente_email || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> ${pedido.cliente_telefone || 'Não informado'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Informações do Pedido:</h6>
                    <p><strong>Data:</strong> ${new Date(pedido.data_pedido).toLocaleString('pt-BR')}</p>
                    <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(pedido.status)}">${getStatusText(pedido.status)}</span></p>
                    <p><strong>Método de Pagamento:</strong> ${pedido.metodo_pagamento}</p>
                </div>
            </div>
            
            <h6 class="mt-4">Endereço de Entrega:</h6>
            <p>${pedido.endereco_entrega || 'Endereço não informado'}</p>
            
            <h6 class="mt-4">Itens do Pedido:</h6>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th>Preço Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        itens.forEach(item => {
            detalhesHTML += `
                <tr>
                    <td>${item.produto_nome}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${parseFloat(item.preco_unitario).toFixed(2)}</td>
                    <td>R$ ${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
            `;
        });
        
        detalhesHTML += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-end"><strong>Subtotal:</strong></td>
                            <td><strong>R$ ${parseFloat(pedido.subtotal).toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-end"><strong>Frete:</strong></td>
                            <td><strong>R$ ${parseFloat(pedido.frete).toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-end"><strong>Total:</strong></td>
                            <td><strong>R$ ${parseFloat(pedido.total).toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('detalhesModal'));
        document.getElementById('detalhesModalBody').innerHTML = detalhesHTML;
        modal.show();
        
    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        mostrarNotificacao('Erro ao carregar detalhes do pedido', 'error');
    }
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    if (window.floriculturaApp) {
        window.floriculturaApp.mostrarNotificacao(mensagem, tipo);
    } else {
        alert(mensagem);
    }
}