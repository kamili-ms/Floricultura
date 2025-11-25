// Sistema de Gerenciamento da Floricultura

class FloriculturaApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.verificarEstadoUsuario();
        this.atualizarContadorCarrinho();
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
        // Verificar se há sessão de usuário (simulação)
        const userStatus = document.getElementById('userStatus');
        if (userStatus) {
            // Em uma implementação real, isso viria do servidor
            const usuarioLogado = localStorage.getItem('usuarioLogado');
            if (usuarioLogado) {
                userStatus.textContent = JSON.parse(usuarioLogado).nome;
            }
        }
    }

    mostrarNotificacao(mensagem, tipo = 'info') {
        // Criar elemento de notificação
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

        // Auto-remover após 3 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Método para filtrar produtos no catálogo
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

        // Atualizar contador
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
    // Limpar dados locais
    localStorage.removeItem('usuarioLogado');
    
    // Redirecionar para página inicial
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
            carregarPedidos(); // Recarregar a lista
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
        
        // Criar modal para mostrar os detalhes
        const modal = new bootstrap.Modal(document.getElementById('detalhesModal'));
        document.getElementById('detalhesModalBody').innerHTML = detalhesHTML;
        modal.show();
        
    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        mostrarNotificacao('Erro ao carregar detalhes do pedido', 'error');
    }
}

