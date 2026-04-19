document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. SISTEMA DE LOGIN FAKE
    // ==========================================
    const loginForm = document.getElementById('login-form');
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');

    // Checar se já possui sessão ativa
    if (localStorage.getItem('rvs_logged') === 'true') {
        loginView.classList.remove('view-active');
        loginView.classList.add('view-hidden');
        appView.classList.remove('view-hidden');
        appView.classList.add('view-active');
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailBox = document.getElementById('login-email');
        const passBox = document.getElementById('login-password');
        
        if (emailBox.value !== 'dhenison@admin.com' || passBox.value !== '123456') {
            alert('Acesso negado. E-mail ou senha incorretos.');
            return;
        }

        // Simular um loading
        const btn = document.getElementById('btn-login');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Entrando...';
        
        setTimeout(() => {
            // Salvar credencial fantasma
            localStorage.setItem('rvs_logged', 'true');
            
            // Esconder login, mostrar App
            loginView.classList.remove('view-active');
            loginView.classList.add('view-hidden');
            
            appView.classList.remove('view-hidden');
            appView.classList.add('view-active');
            
            btn.innerHTML = originalText;
        }, 800);
    });

    // Botão de Logout real
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('rvs_logged');
            window.location.reload();
        });
    }


    // ==========================================
    // 2. NAVEGAÇÃO SPA (SIDEBAR)
    // ==========================================
    const navItems = document.querySelectorAll('.nav-item');
    const pageSections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove 'active' de todos os links do menu
            navItems.forEach(nav => nav.classList.remove('active'));
            // Adiciona 'active' ao clicado
            item.classList.add('active');

            // Obtém qual tela deve abrir
            const targetId = item.getAttribute('data-target');

            // Esconde todas as seções e mostra a correta
            pageSections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('section-active');
                } else {
                    section.classList.remove('section-active');
                }
            });
        });
    });


    // ==========================================
    // 3. DROPDOWN DE HEADER
    // ==========================================
    const profileMenuToggle = document.getElementById('toggle-profile-menu');
    const profileDropdown = document.getElementById('profile-dropdown');

    // O Dropdown de Perfil agora é manejado nativamente via Bootstrap 5 (data-bs-toggle="dropdown")
    
    // Auto-colapsar navbar no mobile ao clicar em um link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const navbarCollapse = document.getElementById('navbarmenu');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
                bsCollapse.hide();
            }
        });
    });

    // Ação de Logout
    document.getElementById('btn-logout').addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.remove('show');
        localStorage.removeItem('rvs_logged');
        window.location.reload();
    });

    // Ação de Limpeza Rápida do App (Wipe Data)
    const btnConfig = document.getElementById('config-btn');
    if (btnConfig) {
        btnConfig.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("⚠️ MODO DESENVOLVEDOR: Deseja realmente APAGAR toda a base de Alunos, Diários e Ocorrências salvos neste navegador para testar uma importação limpa?")) {
                localStorage.removeItem('rvs_alunos_cadastrados');
                localStorage.removeItem('rvs_frequencia');
                localStorage.removeItem('rvs_ocorrencias');
                alert("Limpeza concluída! A página será reiniciada com o banco em branco.");
                window.location.reload();
            }
        });
    }

    // ==========================================
    // 4. MODAL DE PERFIL
    // ==========================================
    const modalPerfil = document.getElementById('perfil-modal');
    const btnOpenPerfil = document.getElementById('meu-perfil-btn');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const formPerfil = document.getElementById('form-perfil');

    // Abrir Modal
    btnOpenPerfil.addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.remove('show');
        modalPerfil.classList.remove('hidden');
    });

    // Fechar Modal (X ou Cancelar)
    const closeModal = () => {
        modalPerfil.classList.add('hidden');
    };
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);

    // Salvar Perfil
    document.getElementById('btn-save-modal').addEventListener('click', () => {
        console.log('Dados do Perfil Prontos para Envio ao Render Back-end!');
        closeModal();
    });


    // ==========================================
    // 5. MÓDULO WHATSAPP (ANEXO E PREVIEW)
    // ==========================================
    const zapTexto = document.getElementById('zap-texto');
    const previewTexto = document.getElementById('chat-preview-text');
    
    // Atualiza preview de texto em tempo real
    zapTexto.addEventListener('input', (e) => {
        const text = e.target.value;
        previewTexto.textContent = text ? text : 'Digite algo para visualizar...';
    });

    // Lógica de Anexo (Upload)
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('zap-anexo');
    const dropContent = document.getElementById('drop-content');
    const previewZone = document.getElementById('preview-zone');
    const previewImg = document.getElementById('file-preview-img');
    const previewFileName = document.getElementById('file-name');
    const btnRemoveFile = document.getElementById('btn-remove-file');
    const chatPreviewImage = document.getElementById('chat-preview-image');

    // Clica na zona para abrir seletor
    dropZone.addEventListener('click', (e) => {
        // Evita abrir se clicar no botão de remover
        if(!e.target.closest('#btn-remove-file')) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFilePreview(file);
        }
    });

    function handleFilePreview(file) {
        previewFileName.textContent = file.name;
        
        // Se for imagem, carregar preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                
                // Atualiza o mockup do whatsapp
                chatPreviewImage.querySelector('img').src = e.target.result;
                chatPreviewImage.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            // Se não for imagem (ex Pdf), mostra icone genérico
            previewImg.src = "https://placehold.co/50x50/1E3A8A/FFFFFF?text=PDF";
        }

        // Troca os conteineres visuais na div de upload
        dropContent.classList.add('hidden');
        previewZone.classList.remove('hidden');
    }

    // Remover Arquivo
    btnRemoveFile.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita reabrir o input
        limparAnexo();
    });

    function limparAnexo() {
        fileInput.value = '';
        dropContent.classList.remove('hidden');
        previewZone.classList.add('hidden');
        chatPreviewImage.classList.add('hidden');
    }

    // Enviar Zap (apenas prevent defaults por hora)
    document.getElementById('btn-enviar-zap').addEventListener('click', (e) => {
        e.preventDefault();
        const texto = zapTexto.value;
        const anexo = fileInput.files[0];
        
        console.log('Disparar Webhook Zap: ', { 
            mensagem: texto, 
            temAnexo: !!anexo 
        });
        
        // Reseta tudo
        zapTexto.value = '';
        previewTexto.textContent = 'Digite algo para visualizar...';
        limparAnexo();
        alert('Comunicado simulado com sucesso (Preparo para API)');
    });

    // ==========================================
    // 6. GESTÃO DE USUÁRIOS E PERMISSÕES
    // ==========================================
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const formUsuarioContainer = document.getElementById('form-usuario-container');
    const btnCancelarUsr = document.getElementById('btn-cancelar-usr');
    const formNovoUsuario = document.getElementById('form-novo-usuario');

    if (btnNovoUsuario && formUsuarioContainer) {
        btnNovoUsuario.addEventListener('click', () => {
            formUsuarioContainer.classList.remove('hidden');
        });

        btnCancelarUsr.addEventListener('click', () => {
            formUsuarioContainer.classList.add('hidden');
            formNovoUsuario.reset();
        });

        formNovoUsuario.addEventListener('submit', (e) => {
            e.preventDefault();
            // Aqui entra a chamada da API (ex: POST /users)
            alert('Novo usuário pronto para ser enviado ao backend!');
            formUsuarioContainer.classList.add('hidden');
            formNovoUsuario.reset();
        });
    }

    // Importação de CSV
    const btnImportarUsr = document.getElementById('btn-importar-usuarios');
    const inputImportarCsv = document.getElementById('input-importar-csv');
    const tbodyUsuarios = document.querySelector('#permissoes .data-table tbody');

    if (btnImportarUsr && inputImportarCsv) {
        btnImportarUsr.addEventListener('click', () => {
            inputImportarCsv.click();
        });

        inputImportarCsv.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const rows = text.split('\n');
                
                let addedCount = 0;
                tbodyUsuarios.innerHTML = ''; // Zera placeholder
                
                // Pular cabeçalho (i=1)
                for (let i = 1; i < rows.length; i++) {
                    const line = rows[i].trim();
                    if (!line) continue;
                    
                    const columns = line.split(';');
                    if (columns.length >= 4) {
                        const [nome, email, senha, funcaoUnformatted] = columns;
                        const funcao = funcaoUnformatted.toLowerCase().trim();
                        
                        // Determinar visual do crachá (badge) e avatar
                        let badgeClass = "badge-pending";
                        let initials = nome.substring(0, 2).toUpperCase();
                        let avatarBg = "#F1F5F9";
                        let avatarColor = "#64748B";

                        if(funcao === 'manager' || funcao === 'diretoria') {
                            badgeClass = "badge-success";
                            avatarBg = "#1E3A8A"; avatarColor = "white";
                        } else if(funcao === 'secretaria') {
                            badgeClass = "badge-success";
                            avatarBg = "#D1FAE5"; avatarColor = "#059669";
                        } else if(funcao === 'coordenacao') {
                            badgeClass = "badge-pending";
                            avatarBg = "#FEF3C7"; avatarColor = "#D97706";
                        } else if(funcao === 'professor') {
                            badgeClass = "badge-pending";
                            avatarBg = "#E0E7FF"; avatarColor = "#1E3A8A";
                        }

                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>
                                <div class="student-row">
                                    <div class="student-avatar" style="background:${avatarBg};color:${avatarColor};">${initials}</div>
                                    <span class="student-name">${nome}</span>
                                </div>
                            </td>
                            <td>${email}</td>
                            <td><span class="badge ${badgeClass}">${funcao.charAt(0).toUpperCase() + funcao.slice(1)}</span></td>
                            <td class="text-right">
                                <button class="btn-icon"><i class="ph ph-pencil-simple"></i></button>
                                <button class="btn-icon text-danger"><i class="ph ph-lock-key"></i></button>
                            </td>
                        `;
                        tbodyUsuarios.appendChild(tr);
                        addedCount++;
                    }
                }
                alert(`Importação concluída! ${addedCount} usuários foram adicionados à lista a partir do arquivo CSV.`);
            };
            reader.readAsText(file);
            inputImportarCsv.value = ''; // Limpa para permitir re-importação
        });
    }

    // ==========================================
    // 7. IMPORTAÇÃO DE ALUNOS (TURMAS & ALUNOS)
    // ==========================================
    const btnImportarAlunos = document.getElementById('btn-importar-alunos');
    const inputImportarAlunos = document.getElementById('input-importar-alunos');
    const tbodyAlunos = document.getElementById('lista-alunos-tbody');
    const selectTurmaAlunos = document.getElementById('select-turma-alunos');
    const searchNomeAlunos = document.getElementById('search-nome-alunos');
    
    let alunosCadastrados = JSON.parse(localStorage.getItem('rvs_alunos_cadastrados')) || [];

    function renderizarTabelaAlunos() {
        if (!tbodyAlunos) return;
        tbodyAlunos.innerHTML = '';
        const turmaFiltro = selectTurmaAlunos ? selectTurmaAlunos.value : '';
        const nomeFiltro = searchNomeAlunos ? searchNomeAlunos.value.toLowerCase().trim() : '';

        const alunosFiltrados = alunosCadastrados.filter(a => {
            const matchTurma = turmaFiltro === '' || a.turma === turmaFiltro;
            const matchNome = nomeFiltro === '' || a.aluno.toLowerCase().includes(nomeFiltro);
            return matchTurma && matchNome;
        });
            
        if (alunosCadastrados.length === 0) {
            tbodyAlunos.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Aguardando importação.</td></tr>`;
            return;
        }

        if (alunosFiltrados.length === 0) {
            tbodyAlunos.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum aluno encontrado com esses filtros.</td></tr>`;
            return;
        }

        alunosFiltrados.forEach(aluno => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="student-row">
                        <div class="student-avatar" style="background:${aluno.avatarBg};color:${aluno.avatarColor};border:1px solid #E2E8F0;">${aluno.initials}</div>
                        <span class="student-name">${aluno.aluno}</span>
                    </div>
                </td>
                <td><span class="badge" style="background:#FEF3C7; color:#D97706;">${aluno.turma}</span></td>
                <td>${aluno.email}</td>
                <td class="text-right">
                    <button class="btn-icon" onclick="alert('Funcionalidade em desenvolvimento')"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon text-danger" onclick="window.removerAluno('${aluno.cpf}')" title="Excluir Aluno"><i class="ph ph-trash"></i></button>
                    <button class="btn-icon btn-outline btn-sm" onclick="window.abrirModalTransferencia('${aluno.cpf}')" title="Transferir de Turma"><i class="ph ph-arrows-left-right"></i></button>
                </td>
            `;
            tbodyAlunos.appendChild(tr);
        });
    }

    window.removerAluno = function(cpf) {
        if(confirm('Tem certeza que deseja excluir este aluno definitivamente? Suas ocorrências serão perdidas após limpeza isolada.')) {
            alunosCadastrados = alunosCadastrados.filter(a => a.cpf !== cpf);
            // Também limpar histórico de ocorrência como cascata simples se quiser, mas aqui limpamos focado na base principal.
            localStorage.setItem('rvs_alunos_cadastrados', JSON.stringify(alunosCadastrados));
            atualizarSelectTurmas();
            renderizarTabelaAlunos();
            if (typeof atualizarDashboard === 'function') atualizarDashboard();
        }
    };

    // ==========================================
    // LÓGICA DE TRANSFERÊNCIA DE TURMA
    // ==========================================
    const modalTransfer = document.getElementById('transfer-modal');
    let alunoEditandoTransferencia = null;

    window.abrirModalTransferencia = function(cpf) {
        alunoEditandoTransferencia = alunosCadastrados.find(a => a.cpf === cpf);
        if (!alunoEditandoTransferencia) return;

        // Atualizar interface do modal
        document.getElementById('transfer-student-name').textContent = `${alunoEditandoTransferencia.aluno} (Turma atual: ${alunoEditandoTransferencia.turma})`;

        // Carregar select de turmas (todas menos a atual)
        const selectNewClass = document.getElementById('select-new-class');
        const turmasUnicas = [...new Set(alunosCadastrados.map(a => a.turma))].sort();
        
        selectNewClass.innerHTML = '<option value="">-- Selecione a nova turma --</option>';
        turmasUnicas.forEach(t => {
            if (t !== alunoEditandoTransferencia.turma) {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = t;
                selectNewClass.appendChild(opt);
            }
        });

        // Carregar histórico
        const tbodyHistory = document.getElementById('transfer-history-tbody');
        tbodyHistory.innerHTML = '';
        const historico = alunoEditandoTransferencia.transferencias || [];
        
        if (historico.length === 0) {
            tbodyHistory.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhuma transferência registrada.</td></tr>';
        } else {
            [...historico].reverse().forEach(h => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${h.dataHora}</td>
                    <td><span class="badge badge-pending">${h.de}</span></td>
                    <td><span class="badge badge-success">${h.para}</span></td>
                `;
                tbodyHistory.appendChild(tr);
            });
        }

        modalTransfer.classList.remove('hidden');
    };

    const fecharModalTransferencia = () => {
        modalTransfer.classList.add('hidden');
        alunoEditandoTransferencia = null;
    };

    document.getElementById('btn-close-transfer')?.addEventListener('click', fecharModalTransferencia);
    document.getElementById('btn-cancel-transfer')?.addEventListener('click', fecharModalTransferencia);

    document.getElementById('btn-confirm-transfer')?.addEventListener('click', () => {
        if (!alunoEditandoTransferencia) return;

        const selectNewClass = document.getElementById('select-new-class');
        const novaTurma = selectNewClass.value;

        if (!novaTurma) {
            alert('Por favor, selecione uma nova turma.');
            return;
        }

        const turmaAntiga = alunoEditandoTransferencia.turma;
        const dataHoraObj = new Date();
        const dataHoraFormatada = `${String(dataHoraObj.getDate()).padStart(2, '0')}/${String(dataHoraObj.getMonth() + 1).padStart(2, '0')}/${dataHoraObj.getFullYear()} ${String(dataHoraObj.getHours()).padStart(2, '0')}:${String(dataHoraObj.getMinutes()).padStart(2, '0')}`;

        // 1. Atualizar o histórico e a turma do aluno
        if (!alunoEditandoTransferencia.transferencias) {
            alunoEditandoTransferencia.transferencias = [];
        }

        alunoEditandoTransferencia.transferencias.push({
            dataHora: dataHoraFormatada,
            de: turmaAntiga,
            para: novaTurma
        });

        alunoEditandoTransferencia.turma = novaTurma;

        // Salvar alunos
        localStorage.setItem('rvs_alunos_cadastrados', JSON.stringify(alunosCadastrados));

        // 2. Migrar Frequências no LocalStorage
        const freqGeral = JSON.parse(localStorage.getItem('rvs_frequencia')) || {};
        let migrou = false;

        Object.keys(freqGeral).forEach(dateStr => {
            if (freqGeral[dateStr][turmaAntiga] && freqGeral[dateStr][turmaAntiga][alunoEditandoTransferencia.cpf]) {
                // Existe registro de frequência para este aluno nesta data na turma antiga
                const registroFrequencia = freqGeral[dateStr][turmaAntiga][alunoEditandoTransferencia.cpf];
                
                // Mover para turma nova
                if (!freqGeral[dateStr][novaTurma]) {
                    freqGeral[dateStr][novaTurma] = {};
                }
                freqGeral[dateStr][novaTurma][alunoEditandoTransferencia.cpf] = registroFrequencia;
                
                // Remover da turma antiga
                delete freqGeral[dateStr][turmaAntiga][alunoEditandoTransferencia.cpf];
                migrou = true;
            }
        });

        if (migrou) {
            localStorage.setItem('rvs_frequencia', JSON.stringify(freqGeral));
        }

        alert(`O aluno foi transferido para a turma ${novaTurma} com sucesso!`);
        
        fecharModalTransferencia();
        atualizarSelectTurmas();
        renderizarTabelaAlunos();

        if (typeof atualizarDashboard === 'function') atualizarDashboard();
    });

    const btnExcluirBase = document.getElementById('btn-excluir-base-alunos');
    if (btnExcluirBase) {
        btnExcluirBase.addEventListener('click', () => {
            const senha = prompt("AÇÃO RESTRITA: Digite a senha do Manager para autorizar a exclusão:");
            if (senha !== '123456') {
                alert("Senha incorreta. Exclusão cancelada.");
                return;
            }

            const turmaSelecionada = selectTurmaAlunos ? selectTurmaAlunos.value : '';
            
            if (turmaSelecionada === '') {
                if (confirm('⚠️ PERIGO: Você está prestes a EXCLUIR TODOS OS ALUNOS do sistema. Deseja prosseguir?')) {
                    alunosCadastrados = [];
                    localStorage.removeItem('rvs_alunos_cadastrados');
                    atualizarSelectTurmas();
                    renderizarTabelaAlunos();
                    if (typeof atualizarDashboard === 'function') atualizarDashboard();
                    alert('Todos os alunos foram excluídos do sistema.');
                }
            } else {
                if (confirm(`Tem certeza que deseja excluir todos os alunos da turma ${turmaSelecionada}?`)) {
                    alunosCadastrados = alunosCadastrados.filter(a => a.turma !== turmaSelecionada);
                    localStorage.setItem('rvs_alunos_cadastrados', JSON.stringify(alunosCadastrados));
                    selectTurmaAlunos.value = '';
                    atualizarSelectTurmas();
                    renderizarTabelaAlunos();
                    if (typeof atualizarDashboard === 'function') atualizarDashboard();
                    alert(`Alunos da turma ${turmaSelecionada} foram excluídos.`);
                }
            }
        });
    }

    function atualizarSelectTurmas() {
        if (!selectTurmaAlunos) return;
        const turmasUnicas = [...new Set(alunosCadastrados.map(a => a.turma))].sort();
        const valorAtual = selectTurmaAlunos.value;
        
        selectTurmaAlunos.innerHTML = '<option value="">Todas as Turmas</option>';
        turmasUnicas.forEach(t => {
            const option = document.createElement('option');
            option.value = t;
            option.textContent = t;
            selectTurmaAlunos.appendChild(option);
        });
        
        if (turmasUnicas.includes(valorAtual)) {
            selectTurmaAlunos.value = valorAtual;
        }
    }

    if (selectTurmaAlunos) {
        selectTurmaAlunos.addEventListener('change', renderizarTabelaAlunos);
    }
    if (searchNomeAlunos) {
        searchNomeAlunos.addEventListener('input', renderizarTabelaAlunos);
    }

    if (btnImportarAlunos && inputImportarAlunos) {
        btnImportarAlunos.addEventListener('click', () => {
            inputImportarAlunos.click();
        });

        inputImportarAlunos.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const rows = text.split('\n');
                
                let addedCount = 0;
                
                // Pular cabeçalho
                for (let i = 1; i < rows.length; i++) {
                    const line = rows[i].trim();
                    if (!line) continue;
                    
                    const columns = line.split(';');
                    // CPF;Nome;Turma;Data de Nascimento;Idade;E-mail;Nome do Pai;Nome da Mãe;Telefone;Senha
                    if (columns.length >= 10) {
                        const [cpf, aluno, turma, dataNasc, idade, email, nomePai, nomeMae, telefone, senha] = columns;
                        
                        let initials = aluno.substring(0, 2).toUpperCase();
                        let avatarBg = "#F8FAFC"; // bg-light
                        let avatarColor = "#1E3A8A"; // primary-blue

                        const existingIndex = alunosCadastrados.findIndex(a => a.cpf === cpf);
                        if (existingIndex !== -1) {
                            // Atualiza/Integraliza o aluno existente em vez de duplicar
                            alunosCadastrados[existingIndex] = {
                                cpf, aluno, turma, dataNasc, idade, email, nomePai, nomeMae, telefone, senha, initials, avatarBg, avatarColor
                            };
                        } else {
                            // Nova matrícula
                            alunosCadastrados.push({
                                cpf, aluno, turma, dataNasc, idade, email, nomePai, nomeMae, telefone, senha, initials, avatarBg, avatarColor
                            });
                            addedCount++;
                        }
                    }
                }
                
                localStorage.setItem('rvs_alunos_cadastrados', JSON.stringify(alunosCadastrados));
                atualizarDashboard();
                
                atualizarSelectTurmas();
                renderizarTabelaAlunos();
                alert(`Importação concluída! ${addedCount} alunos matriculados com sucesso.`);
            };
            reader.readAsText(file);
            inputImportarAlunos.value = ''; // Limpa
        });
    }
    // ==========================================
    // 8. ABA DE FREQUÊNCIA
    // ==========================================
    const selectTurnoFreq = document.getElementById('select-turno-freq');
    const selectTurmaFreq = document.getElementById('select-turma-freq');
    const selectMesFreq = document.getElementById('select-mes-freq');
    const selectDiaFreq = document.getElementById('select-dia-freq');
    const tbodyFreq = document.getElementById('lista-freq-tbody');
    const btnConsolidarChamada = document.getElementById('btn-consolidar-chamada');
    const statusConsolidacao = document.getElementById('status-consolidacao');

    const mapaTurmasFreq = {
        'Manhã': ['M1MNM01', 'M1MNM02', 'M1MNM03', 'M1MNM04', 'M1MNM05', 'M2MNM01', 'M2MNM02', 'M2MNM03', 'M2MNM04', 'M3MNM01', 'M3MNM02', 'M3MNM03'],
        'Tarde': ['M1TNM01', 'M1TNM02', 'M1TNM03', 'M1TNM04', 'M1TNM05', 'M2TNM01', 'M2TNM02', 'M2TNM03', 'M2TNM04', 'M3TNM01', 'M3TNM02', 'M3TNM03'],
        'Noite': ['M1NNM01', 'M1NNM02', 'M2NNM01', 'M2NNM02', 'M2NNM03', 'M3TNM01', 'M3TNM02', 'M3TNM03', 'M1NNJ01', 'M1NNJ02', 'M2NNJ01', 'M1NCF03']
    };

    if (selectTurnoFreq && selectTurmaFreq) {
        selectTurnoFreq.addEventListener('change', () => {
            const turno = selectTurnoFreq.value;
            selectTurmaFreq.innerHTML = '<option value="">-- Selecione a Turma --</option>';
            if (turno && mapaTurmasFreq[turno]) {
                mapaTurmasFreq[turno].forEach(t => {
                    const option = document.createElement('option');
                    option.value = t;
                    option.textContent = t;
                    selectTurmaFreq.appendChild(option);
                });
            }
            renderizarFrequencia();
        });

        selectTurmaFreq.addEventListener('change', renderizarFrequencia);
        
        if (selectMesFreq) {
            selectMesFreq.addEventListener('change', () => {
                const mes = selectMesFreq.value;
                selectDiaFreq.innerHTML = '<option value="">-- Escolha o Dia --</option>';
                if (!mes) return;
                
                // Mapear dias letivos do calendário
                const anoLocal = 2026;
                const mesNum = parseInt(mes);
                const diasNoMes = new Date(anoLocal, mesNum + 1, 0).getDate();
                const calGlobal = JSON.parse(localStorage.getItem('rvs_calendario_2026')) || {};
                
                for(let d=1; d<=diasNoMes; d++) {
                    const dStr = `${anoLocal}-${String(mesNum+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const diaSemana = new Date(anoLocal, mesNum, d).getDay();
                    let eLetivo = false;
                    let titulo = "";
                    
                    if (calGlobal[dStr]) {
                        if (calGlobal[dStr].tipo === 'letivo' || calGlobal[dStr].tipo === 'evento') {
                            eLetivo = true;
                            titulo = calGlobal[dStr].titulo ? ` - ${calGlobal[dStr].titulo}` : '';
                        }
                    } else {
                        // Comportamento default auto-preenchido
                        if (diaSemana !== 0 && diaSemana !== 6) eLetivo = true;
                    }
                    
                    if (eLetivo) {
                        const opt = document.createElement('option');
                        opt.value = dStr;
                        const nomeSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][diaSemana];
                        opt.textContent = `Dia ${d} (${nomeSemana})${titulo}`;
                        selectDiaFreq.appendChild(opt);
                    }
                }
                renderizarFrequencia();
            });
            
            selectDiaFreq.addEventListener('change', renderizarFrequencia);
        }
    }

    function renderizarFrequencia() {
        if (!tbodyFreq) return;
        const turma = selectTurmaFreq.value;
        const turno = selectTurnoFreq.value;
        const dateStr = selectDiaFreq ? selectDiaFreq.value : null;
        
        if (!turno || !turma || !dateStr) {
            tbodyFreq.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Preencha todos os filtros (Turno, Turma, Mês e Dia) para abrir o diário.</td></tr>';
            return;
        }

        const todosAlunos = alunosCadastrados.length > 0 ? alunosCadastrados : (JSON.parse(localStorage.getItem('rvs_alunos_cadastrados')) || []);
        const alunosDaTurma = todosAlunos.filter(a => a.turma === turma);

        if (alunosDaTurma.length === 0) {
            tbodyFreq.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum aluno da turma ${turma} encontrado na base de dados. Realize a importação primeiro!</td></tr>`;
            return;
        }

        // Buscar Cache de Frequência para esse dia
        const freqGeral = JSON.parse(localStorage.getItem('rvs_frequencia')) || {};
        const cacheDia = freqGeral[dateStr] && freqGeral[dateStr][turma] ? freqGeral[dateStr][turma] : null;

        tbodyFreq.innerHTML = '';
        
        alunosDaTurma.forEach(aluno => {
            const cacheAluno = cacheDia ? cacheDia[aluno.cpf] : null;
            const entAtiva = cacheAluno ? cacheAluno.e : 'P';
            const saiAtiva = cacheAluno ? cacheAluno.s : 'P';
            const motivEnt = cacheAluno ? (cacheAluno.motivE || '') : '';
            const motivSai = cacheAluno ? (cacheAluno.motivS || '') : '';
            
            // Classes para os botões E
            const eClsP = entAtiva === 'P' ? 'selected selected-p' : '';
            const eClsF = entAtiva === 'F' ? 'selected selected-f' : '';
            const eClsFJ = entAtiva === 'FJ' ? 'selected selected-fj' : '';
            
            // Classes para os botões S
            const sClsP = saiAtiva === 'P' ? 'selected selected-p' : '';
            const sClsF = saiAtiva === 'F' ? 'selected selected-f' : '';
            const sClsFJ = saiAtiva === 'FJ' ? 'selected selected-fj' : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="student-row">
                        <div class="student-avatar" style="background:${aluno.avatarBg};color:${aluno.avatarColor};border:1px solid #E2E8F0;">${aluno.initials}</div>
                        <span class="student-name">${aluno.aluno}</span>
                    </div>
                </td>
                <td class="text-center" style="vertical-align: top;">
                    <div style="display: flex; gap: 0.25rem; justify-content: center; margin-top:0.25rem;">
                        <button class="btn-chamada ${eClsP}" data-val="P" data-tipo="E" data-cpf="${aluno.cpf}">P</button>
                        <button class="btn-chamada ${eClsF}" data-val="F" data-tipo="E" data-cpf="${aluno.cpf}">F</button>
                        <button class="btn-chamada ${eClsFJ}" data-val="FJ" data-tipo="E" data-cpf="${aluno.cpf}">FJ</button>
                    </div>
                    <div class="motivo-fj-container ${entAtiva === 'FJ' ? '' : 'hidden'} mt-1" id="fj-E-${aluno.cpf}">
                        <select class="input-select" style="padding: 0.2rem; font-size: 0.75rem; height: auto;">
                            <option value="">Motivo...</option>
                            <option value="Atestado Médico" ${motivEnt === 'Atestado Médico' ? 'selected' : ''}>Atestado Médico</option>
                            <option value="Solicitação dos Pais" ${motivEnt === 'Solicitação dos Pais' ? 'selected' : ''}>Solicitação Pais</option>
                            <option value="Saída Antecipada" ${motivEnt === 'Saída Antecipada' ? 'selected' : ''}>Saída Antecipada</option>
                        </select>
                    </div>
                </td>
                <td class="text-center" style="vertical-align: top;">
                    <div style="display: flex; gap: 0.25rem; justify-content: center; margin-top:0.25rem;">
                        <button class="btn-chamada ${sClsP}" data-val="P" data-tipo="S" data-cpf="${aluno.cpf}">P</button>
                        <button class="btn-chamada ${sClsF}" data-val="F" data-tipo="S" data-cpf="${aluno.cpf}">F</button>
                        <button class="btn-chamada ${sClsFJ}" data-val="FJ" data-tipo="S" data-cpf="${aluno.cpf}">FJ</button>
                    </div>
                    <div class="motivo-fj-container ${saiAtiva === 'FJ' ? '' : 'hidden'} mt-1" id="fj-S-${aluno.cpf}">
                        <select class="input-select" style="padding: 0.2rem; font-size: 0.75rem; height: auto;">
                            <option value="">Motivo...</option>
                            <option value="Atestado Médico" ${motivSai === 'Atestado Médico' ? 'selected' : ''}>Atestado Médico</option>
                            <option value="Solicitação dos Pais" ${motivSai === 'Solicitação dos Pais' ? 'selected' : ''}>Solicitação Pais</option>
                            <option value="Saída Antecipada" ${motivSai === 'Saída Antecipada' ? 'selected' : ''}>Saída Antecipada</option>
                        </select>
                    </div>
                </td>
                <td class="text-center" style="vertical-align: middle;">
                    <span class="badge badge-pending consolidado-status" id="status-${aluno.cpf}">Pendente</span>
                </td>
            `;
            tbodyFreq.appendChild(tr);
            calcularConsolidado(aluno.cpf); // Roda imediatamente
        });

        vincularEventosChamada();
        statusConsolidacao.textContent = cacheDia ? "Diário restaurado da memória!" : "Novo diário pré-preenchido pronto para ser ajustado.";
        statusConsolidacao.style.color = '#64748B'; // normal text-muted
    }

    function vincularEventosChamada() {
        const botoes = document.querySelectorAll('.btn-chamada');
        botoes.forEach(btn => {
            btn.addEventListener('click', () => {
                const tipo = btn.getAttribute('data-tipo');
                const val = btn.getAttribute('data-val');
                const cpf = btn.getAttribute('data-cpf');
                
                // Remove selected visual dos irmãos
                const grupoBtns = document.querySelectorAll(`.btn-chamada[data-tipo="${tipo}"][data-cpf="${cpf}"]`);
                grupoBtns.forEach(b => b.classList.remove('selected', 'selected-p', 'selected-f', 'selected-fj'));
                
                // Add select class com base no valor
                btn.classList.add('selected');
                if (val === 'P') btn.classList.add('selected-p');
                if (val === 'F') btn.classList.add('selected-f');
                if (val === 'FJ') btn.classList.add('selected-fj');
                
                const fjContainer = document.getElementById(`fj-${tipo}-${cpf}`);
                if (val === 'FJ') {
                    fjContainer.classList.remove('hidden');
                } else {
                    fjContainer.classList.add('hidden');
                    const select = fjContainer.querySelector('select');
                    if (select) select.value = '';
                }

                calcularConsolidado(cpf);
            });
        });
    }

    function calcularConsolidado(cpf) {
        const entradaBtn = document.querySelector(`.btn-chamada[data-tipo="E"][data-cpf="${cpf}"].selected`);
        const saidaBtn = document.querySelector(`.btn-chamada[data-tipo="S"][data-cpf="${cpf}"].selected`);
        const spanStatus = document.getElementById(`status-${cpf}`);

        if (!entradaBtn || !saidaBtn) {
            spanStatus.className = 'badge badge-pending consolidado-status';
            spanStatus.textContent = 'Pendente';
            return;
        }

        const eVal = entradaBtn.getAttribute('data-val');
        const sVal = saidaBtn.getAttribute('data-val');
        let final = '';

        if (eVal === 'FJ' || sVal === 'FJ') {
            final = 'P'; // A falta justificada anula a falta global
        } else if (eVal === 'P' && sVal === 'P') {
            final = 'P';
        } else if (eVal === 'P' && sVal === 'F') {
            final = 'F';
        } else if (eVal === 'F' && sVal === 'F') {
            final = 'F';
        } else if (eVal === 'F' && sVal === 'P') {
            final = 'F'; // Se não foi embora na entrada mas está pres na saída? Atípico, mas sem Entrada é F
        }

        if (final === 'P') {
            spanStatus.className = 'badge badge-success consolidado-status';
            spanStatus.textContent = 'Presente';
            spanStatus.style.background = '#D1FAE5';
            spanStatus.style.color = '#059669';
        } else {
            spanStatus.className = 'badge text-danger consolidado-status';
            spanStatus.textContent = 'Faltou';
            spanStatus.style.background = '#FEE2E2';
            spanStatus.style.color = '#DC2626';
        }
    }

    if (btnConsolidarChamada) {
        btnConsolidarChamada.addEventListener('click', () => {
             const todosStatus = document.querySelectorAll('.consolidado-status');
             let concluidos = 0;
             todosStatus.forEach(span => {
                 if (span.textContent !== 'Pendente') concluidos++;
             });
             
             if (todosStatus.length > 0 && concluidos < todosStatus.length) {
                 alert('Existem alunos com a frequência pendente. Preencha Entrada e Saída de toda a classe antes de consolidar.');
                 return;
             }
             if (todosStatus.length === 0) {
                 alert('Selecione uma turma primeiro.');
                 return;
             }
             
             const dateStr = selectDiaFreq.value;
             const turma = selectTurmaFreq.value;
             const freqAll = JSON.parse(localStorage.getItem('rvs_frequencia')) || {};
             
             if (!freqAll[dateStr]) freqAll[dateStr] = {};
             freqAll[dateStr][turma] = {};
             
             const alunosRows = tbodyFreq.querySelectorAll('tr');
             alunosRows.forEach(tr => {
                 const cpfBtn = tr.querySelector('.btn-chamada');
                 if(!cpfBtn) return;
                 const cpf = cpfBtn.getAttribute('data-cpf');
                 
                 const eBtn = tr.querySelector(`.btn-chamada[data-tipo="E"].selected`);
                 const sBtn = tr.querySelector(`.btn-chamada[data-tipo="S"].selected`);
                 const evtVal = eBtn ? eBtn.getAttribute('data-val') : '';
                 const svtVal = sBtn ? sBtn.getAttribute('data-val') : '';
                 
                 let motivE = '';
                 let motivS = '';
                 
                 if (evtVal === 'FJ') motivE = tr.querySelector(`#fj-E-${cpf} select`).value;
                 if (svtVal === 'FJ') motivS = tr.querySelector(`#fj-S-${cpf} select`).value;
                 
                 freqAll[dateStr][turma][cpf] = {
                     e: evtVal,
                     s: svtVal,
                     motivE: motivE,
                     motivS: motivS
                 };
             });
             
             localStorage.setItem('rvs_frequencia', JSON.stringify(freqAll));

             statusConsolidacao.textContent = `Salvo no sistema: Frequência do dia ${dateStr.split('-').reverse().join('/')} validada.`;
             statusConsolidacao.style.color = '#059669';
             if (typeof atualizarDashboard === 'function') atualizarDashboard();
             alert('Chamada salva em sistema! Relatórios atualizados.');
        });
    }

    // ==========================================
    // 9. ABA DE CALENDÁRIO LETIVO 2026
    // ==========================================
    const calYear = 2026;
    let calCurrentMonth = 0; // Janeiro
    
    const calGrid = document.getElementById('calendar-grid');
    const calMonthDisplay = document.getElementById('calendar-month-display');
    const btnPrevMonth = document.getElementById('btn-prev-month');
    const btnNextMonth = document.getElementById('btn-next-month');
    
    const calMonthsNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    const calTypesConfig = {
        'letivo': { label: 'Dia Letivo', class: 'tipo-letivo' },
        'feriado': { label: 'Feriado', class: 'tipo-feriado' },
        'evento': { label: 'Evento Escolar', class: 'tipo-evento' },
        'recesso': { label: 'Recesso', class: 'tipo-recesso' }
    };
    
    let calData = JSON.parse(localStorage.getItem('rvs_calendario_2026')) || {};

    function renderCalendar() {
        if (!calGrid) return;
        calGrid.innerHTML = '';
        
        calMonthDisplay.textContent = `${calMonthsNames[calCurrentMonth]} ${calYear}`;
        
        const firstDay = new Date(calYear, calCurrentMonth, 1).getDay(); // 0(Sun) - 6(Sat)
        const daysInMonth = new Date(calYear, calCurrentMonth + 1, 0).getDate();
        
        // Células vazias (dias do mês anterior)
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'calendar-day empty';
            calGrid.appendChild(emptyDiv);
        }
        
        // Dias 1 até fim do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${calYear}-${String(calCurrentMonth+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayOfWeek = new Date(calYear, calCurrentMonth, day).getDay();
            
            let diaData = calData[dateStr];
            
            if (!diaData) {
                // Auto preenchimento inteligente (Finais de Semana e mês de Julho = Férias)
                if (dayOfWeek === 0 || dayOfWeek === 6 || calCurrentMonth === 6) {
                    let tituloRecesso = calCurrentMonth === 6 ? 'Férias Escolares' : '';
                    diaData = { tipo: 'recesso', titulo: tituloRecesso };
                } else {
                    diaData = { tipo: 'letivo', titulo: '' };
                }
            }
            
            const cell = document.createElement('div');
            cell.className = `calendar-day`;
            cell.dataset.date = dateStr;
            cell.dataset.tipo = diaData.tipo;
            cell.dataset.titulo = diaData.titulo;
            
            const typeConfig = calTypesConfig[diaData.tipo];
            
            cell.innerHTML = `
                <span class="day-number">${day}</span>
                ${diaData.tipo !== 'recesso' ? `<span class="day-label ${typeConfig.class}">${typeConfig.label}</span>` : ''}
                ${diaData.titulo ? `<span class="day-title">${diaData.titulo}</span>` : ''}
            `;
            
            cell.addEventListener('click', () => onDayClick(dateStr, diaData.tipo));
            
            calGrid.appendChild(cell);
        }
    }
    
    if (btnPrevMonth && btnNextMonth) {
        btnPrevMonth.addEventListener('click', () => {
            if (calCurrentMonth > 0) { calCurrentMonth--; renderCalendar(); }
        });
        btnNextMonth.addEventListener('click', () => {
            if (calCurrentMonth < 11) { calCurrentMonth++; renderCalendar(); }
        });
    }

    const toggleSequence = {
        'recesso': 'letivo',
        'letivo': 'feriado',
        'feriado': 'evento',
        'evento': 'recesso'
    };

    function onDayClick(dateStr, currentType) {
        let nextType = toggleSequence[currentType] || 'letivo';
        
        // Shortcut especial para Sábados
        const dParts = dateStr.split('-');
        const diaSemana = new Date(dParts[0], dParts[1] - 1, dParts[2]).getDay();
        if (diaSemana === 6 && currentType === 'recesso') {
            nextType = 'evento'; // Pula direto para Azul Claro (Sábado Letivo)
        }

        let newTitle = '';
        
        if (nextType === 'feriado') {
            newTitle = window.prompt("Qual é a legenda/motivo deste Feriado?");
            if (newTitle === null) return; // cancela o click
        } else if (nextType === 'evento') {
            newTitle = window.prompt("Qual é a legenda deste Dia Letivo Especial / Evento?");
            if (newTitle === null) return; // cancela o click
        }
        
        calData[dateStr] = { tipo: nextType, titulo: newTitle };
        localStorage.setItem('rvs_calendario_2026', JSON.stringify(calData));
        renderCalendar();
    }
    
    // ==========================================
    // 10. ABA DE OCORRÊNCIAS
    // ==========================================
    const selectTurnoOcor = document.getElementById('select-turno-ocor');
    const selectTurmaOcor = document.getElementById('select-turma-ocor');
    const selectAlunoOcor = document.getElementById('select-aluno-ocor');
    const formOcorContainer = document.getElementById('form-ocorrencia-container');
    const nomeAlunoOcor = document.getElementById('nome-aluno-ocorrencia');
    const formOcor = document.getElementById('form-nova-ocorrencia');
    const tbodyOcor = document.getElementById('tbody-ocorrencias');

    if (selectTurnoOcor && selectTurmaOcor && selectAlunoOcor) {
        selectTurnoOcor.addEventListener('change', () => {
            const turno = selectTurnoOcor.value;
            selectTurmaOcor.innerHTML = '<option value="">-- Selecione a Turma --</option>';
            selectAlunoOcor.innerHTML = '<option value="">-- Selecione a Turma primeiro --</option>';
            formOcorContainer.classList.add('hidden');
            tbodyOcor.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Selecione um aluno acima para visualizar o histórico.</td></tr>';
            
            if (turno && mapaTurmasFreq[turno]) {
                mapaTurmasFreq[turno].forEach(t => {
                    const option = document.createElement('option');
                    option.value = t;
                    option.textContent = t;
                    selectTurmaOcor.appendChild(option);
                });
            }
        });

        selectTurmaOcor.addEventListener('change', () => {
            const turma = selectTurmaOcor.value;
            selectAlunoOcor.innerHTML = '<option value="">-- Selecione o Aluno --</option>';
            formOcorContainer.classList.add('hidden');
            tbodyOcor.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Selecione um aluno acima para visualizar o histórico.</td></tr>';
            
            if (!turma) return;
            
            const todosAlunos = alunosCadastrados.length > 0 ? alunosCadastrados : (JSON.parse(localStorage.getItem('rvs_alunos_cadastrados')) || []);
            const alunosDaTurma = todosAlunos.filter(a => a.turma === turma);
            
            alunosDaTurma.forEach(aluno => {
                const option = document.createElement('option');
                option.value = aluno.cpf;
                option.textContent = aluno.aluno;
                option.dataset.nome = aluno.aluno;
                selectAlunoOcor.appendChild(option);
            });
        });

        selectAlunoOcor.addEventListener('change', () => {
            const cpf = selectAlunoOcor.value;
            if (!cpf) {
                formOcorContainer.classList.add('hidden');
                tbodyOcor.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Selecione um aluno acima para visualizar o histórico.</td></tr>';
                return;
            }
            
            const nomeStr = selectAlunoOcor.options[selectAlunoOcor.selectedIndex].dataset.nome;
            nomeAlunoOcor.textContent = nomeStr;
            formOcorContainer.classList.remove('hidden');
            renderizarHistoricoOcorrencias(cpf);
        });

        const ocorTipo = document.getElementById('ocor-tipo');
        const ocorSuspensaoDates = document.getElementById('ocor-suspensao-dates');
        if (ocorTipo && ocorSuspensaoDates) {
            ocorTipo.addEventListener('change', () => {
                if (ocorTipo.value === 'Suspensão') {
                    ocorSuspensaoDates.classList.remove('hidden');
                } else {
                    ocorSuspensaoDates.classList.add('hidden');
                }
            });
        }

        formOcor.addEventListener('submit', (e) => {
            e.preventDefault();
            const cpf = selectAlunoOcor.value;
            if(!cpf) return;
            
            const tipo = document.getElementById('ocor-tipo').value;
            const comunicar = document.getElementById('ocor-comunicar').value;
            const motivo = document.getElementById('ocor-motivo').value.trim();
            
            let dataInicio = '';
            let dataRetorno = '';
            if (tipo === 'Suspensão') {
                dataInicio = document.getElementById('ocor-data-inicio').value;
                dataRetorno = document.getElementById('ocor-data-retorno').value;
                if (!dataInicio || !dataRetorno) {
                    alert('Por favor, preencha as datas de início e retorno da suspensão.');
                    return;
                }
            }

            const dataHora = new Date().toLocaleString('pt-BR');
            const autor = "Admin Manager"; // Simulando autor logado
            
            const ocorrenciasGlobais = JSON.parse(localStorage.getItem('rvs_ocorrencias')) || {};
            if(!ocorrenciasGlobais[cpf]) ocorrenciasGlobais[cpf] = [];
            
            ocorrenciasGlobais[cpf].push({
                dataHora, tipo, comunicar, motivo, autor, dataInicio, dataRetorno
            });
            
            localStorage.setItem('rvs_ocorrencias', JSON.stringify(ocorrenciasGlobais));
            
            document.getElementById('ocor-motivo').value = '';
            document.getElementById('ocor-data-inicio').value = '';
            document.getElementById('ocor-data-retorno').value = '';
            if (typeof atualizarDashboard === 'function') atualizarDashboard();
            renderizarHistoricoOcorrencias(cpf);
        });
    }

    function renderizarHistoricoOcorrencias(cpf) {
        if (!tbodyOcor) return;
        const ocorrenciasGlobais = JSON.parse(localStorage.getItem('rvs_ocorrencias')) || {};
        const historico = ocorrenciasGlobais[cpf] || [];
        
        if (historico.length === 0) {
            tbodyOcor.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma ocorrência registrada para este aluno.</td></tr>';
            return;
        }
        
        tbodyOcor.innerHTML = '';
        // Inverte para os mais recentes no topo
        [...historico].reverse().forEach((oc) => {
            const tr = document.createElement('tr');
            const corBg = oc.tipo === 'Suspensão' ? '#FEE2E2' : '#FEF3C7';
            const corTxt = oc.tipo === 'Suspensão' ? '#DC2626' : '#D97706';
            
            const badgePais = oc.comunicar === 'Sim' ? '<span class="badge badge-success">Sim</span>' : '<span class="badge" style="background:#E2E8F0; color:#475569;">Não</span>';
            
            let infoDatas = '';
            if (oc.tipo === 'Suspensão' && oc.dataInicio && oc.dataRetorno) {
                const brInicio = oc.dataInicio.split('-').reverse().join('/');
                const brRetorno = oc.dataRetorno.split('-').reverse().join('/');
                infoDatas = `<div style="font-size:0.75rem; color:#64748B; margin-top:0.25rem;">${brInicio} até ${brRetorno}</div>`;
            }

            tr.innerHTML = `
                <td><div style="font-size:0.85rem; color:#64748B;">${oc.dataHora}</div></td>
                <td>
                    <span class="badge" style="background:${corBg}; color:${corTxt}">${oc.tipo}</span>
                    ${infoDatas}
                </td>
                <td><div style="font-size:0.875rem;">${oc.motivo}</div></td>
                <td><div style="font-size:0.875rem; font-weight: 500;">${oc.autor}</div></td>
                <td class="text-center">${badgePais}</td>
            `;
            tbodyOcor.appendChild(tr);
        });
    }

    // ==========================================
    // 11. DASHBOARD DINÂMICO
    // ==========================================
    function atualizarDashboard() {
        const spanTotalAlunos = document.getElementById('dash-total-alunos');
        const spanPresencaHoje = document.getElementById('dash-presenca-hoje');
        const spanOcorrenciasMes = document.getElementById('dash-ocorrencias-mes');
        const spanTurmasAtivas = document.getElementById('dash-turmas-ativas');
        const tbodyEvasao = document.getElementById('dash-evasao-tbody');
        const tbodySaidaIndevida = document.getElementById('dash-saida-indevida-tbody');

        if (!spanTotalAlunos) return;

        // 1. Total de Alunos Matriculados
        const dadosAlunos = JSON.parse(localStorage.getItem('rvs_alunos_cadastrados')) || [];
        spanTotalAlunos.textContent = dadosAlunos.length;

        // 2. Turmas Ativas
        const turmasUnicas = [...new Set(dadosAlunos.map(a => a.turma).filter(Boolean))];
        spanTurmasAtivas.textContent = turmasUnicas.length;

        // 3. Ocorrências do Mês Atual
        const dadosOcorrencias = JSON.parse(localStorage.getItem('rvs_ocorrencias')) || {};
        let ocorrenciasMesVal = 0;
        const currentMonth = new Date().getMonth() + 1; // 1-12
        Object.values(dadosOcorrencias).forEach(arrayAc => {
            arrayAc.forEach(oc => {
                if (oc.dataHora) {
                    const [datePart] = oc.dataHora.split(' ');
                    if (datePart) {
                        const monthPart = parseInt(datePart.split('/')[1]);
                        if (monthPart === currentMonth) {
                            ocorrenciasMesVal++;
                        }
                    }
                }
            });
        });
        spanOcorrenciasMes.textContent = ocorrenciasMesVal;

        // 4. Última Presença Média & Alerta de Evasão
        const dadosFreq = JSON.parse(localStorage.getItem('rvs_frequencia')) || {};
        const datasDisponiveis = Object.keys(dadosFreq).sort(); 
        
        let somaPresencas = 0;
        let totalRegistros = 0;
        let mapFaltasEvasao = {}; // { cpf: acumuladoFaltasGerais }

        if (datasDisponiveis.length === 0) {
            spanPresencaHoje.textContent = '-';
            tbodyEvasao.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Sem dados de frequência disponíveis para análise.</td></tr>';
        } else {
            // Média de Presença da ÚLTIMA data cadastrada
            const lastDate = datasDisponiveis[datasDisponiveis.length - 1];
            const turmasDaUltimaData = dadosFreq[lastDate];
            
            Object.values(turmasDaUltimaData).forEach(cpfsNaTurma => {
                Object.values(cpfsNaTurma).forEach(freqRegistro => {
                    totalRegistros++;
                    const ep = freqRegistro.e;
                    const sp = freqRegistro.s;
                    // Considerando Presença se a pessoa não faltou em ambos. Se for Falta Completa, nao conta ponto.
                    if (ep !== 'F' && ep !== 'FJ' && sp !== 'F' && sp !== 'FJ') {
                        somaPresencas++;
                    }
                });
            });

            const percentual = totalRegistros > 0 ? Math.round((somaPresencas / totalRegistros) * 100) : 0;
            spanPresencaHoje.textContent = `${percentual}%`;

            // Escaneamento Global Evasão e Saída Indevida (Todas as Datas Disponíveis)
            let listSaidaIndevida = [];

            datasDisponiveis.forEach(d => {
                const dataBr = d.split('-').reverse().join('/');
                Object.values(dadosFreq[d]).forEach(cpfs => {
                    Object.keys(cpfs).forEach(cpf => {
                        const rec = cpfs[cpf];
                        if (rec.e === 'F' && rec.s === 'F') { 
                            mapFaltasEvasao[cpf] = (mapFaltasEvasao[cpf] || 0) + 1;
                        }
                        if ((rec.e === 'P' && rec.s === 'F') || (rec.e === 'F' && rec.s === 'P')) {
                            let exist = listSaidaIndevida.find(i => i.cpf === cpf);
                            if (!exist) {
                                const alunoObj = dadosAlunos.find(a => a.cpf === cpf);
                                if (alunoObj) {
                                    listSaidaIndevida.push({
                                        cpf: cpf,
                                        aluno: alunoObj.aluno,
                                        turma: alunoObj.turma,
                                        datas: [dataBr]
                                    });
                                }
                            } else {
                                if (!exist.datas.includes(dataBr)) {
                                    exist.datas.push(dataBr);
                                }
                            }
                        }
                    });
                });
            });

            const vulneraveis = [];
            Object.keys(mapFaltasEvasao).forEach(cpf => {
                if (mapFaltasEvasao[cpf] >= 3) {
                    const alunoObj = dadosAlunos.find(a => a.cpf === cpf);
                    if (alunoObj) {
                        vulneraveis.push({
                            aluno: alunoObj.aluno,
                            turma: alunoObj.turma,
                            qtdFaltas: mapFaltasEvasao[cpf]
                        });
                    }
                }
            });

            vulneraveis.sort((a, b) => b.qtdFaltas - a.qtdFaltas);

            if (vulneraveis.length === 0) {
                tbodyEvasao.innerHTML = '<tr><td colspan="4" class="text-center" style="color: #059669; font-weight: 500; padding:1.5rem;"><i class="ph ph-check-circle" style="font-size:1.5rem; vertical-align:middle; margin-right:4px;"></i> Nenhum aluno alcançou a zona crítica de evasão (3+ Faltas Globais).</td></tr>';
            } else {
                tbodyEvasao.innerHTML = '';
                // Mostra no maximo o TOP 5 Piores
                vulneraveis.slice(0, 5).forEach(v => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong style="color: #1E293B;">${v.aluno}</strong></td>
                        <td><span class="badge" style="background:#E2E8F0; color:#475569;">${v.turma}</span></td>
                        <td class="text-center"><span style="color: #DC2626; font-weight: 800;">${v.qtdFaltas} dias</span></td>
                        <td class="text-right"><button class="btn-outline" style="border-color:#DC2626; color:#DC2626; padding: 0.25rem 0.75rem; font-size: 0.8rem;" onclick="alert('Funcionalidade Web WhatsApp em breve!')"><i class="ph ph-whatsapp-logo"></i> Acionar</button></td>
                    `;
                    tbodyEvasao.appendChild(tr);
                });
            }

            if (listSaidaIndevida.length === 0) {
                if (tbodySaidaIndevida) {
                    tbodySaidaIndevida.innerHTML = '<tr><td colspan="4" class="text-center" style="color: #059669; font-weight: 500; padding:1.5rem;"><i class="ph ph-check-circle" style="font-size:1.5rem; vertical-align:middle; margin-right:4px;"></i> Nenhum aluno com saída não autorizada detectado.</td></tr>';
                }
            } else {
                if (tbodySaidaIndevida) {
                    tbodySaidaIndevida.innerHTML = '';
                    listSaidaIndevida.forEach(v => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td><strong style="color: #1E293B;">${v.aluno}</strong></td>
                            <td><span class="badge" style="background:#E2E8F0; color:#475569;">${v.turma}</span></td>
                            <td class="text-center"><span style="color: #D97706; font-weight: 600;">${v.datas.join(', ')}</span></td>
                            <td class="text-right"><button class="btn-outline" style="border-color:#D97706; color:#D97706; padding: 0.25rem 0.75rem; font-size: 0.8rem;" onclick="alert('Funcionalidade Web WhatsApp em breve!')"><i class="ph ph-whatsapp-logo"></i> Acionar</button></td>
                        `;
                        tbodySaidaIndevida.appendChild(tr);
                    });
                }
            }

            // ==========================================
            // ALERTA DE RETORNO DE SUSPENSÃO
            // ==========================================
            const tbodyRetornoSuspensao = document.getElementById('dash-retorno-suspensao-tbody');
            if (tbodyRetornoSuspensao) {
                const hojeObj = new Date();
                const hojeStr = `${hojeObj.getFullYear()}-${String(hojeObj.getMonth() + 1).padStart(2, '0')}-${String(hojeObj.getDate()).padStart(2, '0')}`;
                
                let retornosHoje = [];
                const ocorrenciasGerais = JSON.parse(localStorage.getItem('rvs_ocorrencias')) || {};
                
                // Encontrar os alunos com retorno agendado para hoje
                Object.keys(ocorrenciasGerais).forEach(cpf => {
                    const historico = ocorrenciasGerais[cpf];
                    historico.forEach(oc => {
                        if (oc.tipo === 'Suspensão' && oc.dataRetorno === hojeStr) {
                            // Achou uma suspensão cujo retorno é hoje
                            const alunoObj = dadosAlunos.find(a => a.cpf === cpf);
                            if (alunoObj) {
                                // Evitar duplicatas caso tenha mais de uma (raro, mas possível)
                                if (!retornosHoje.find(r => r.cpf === cpf)) {
                                    retornosHoje.push({
                                        cpf: cpf,
                                        aluno: alunoObj.aluno,
                                        turma: alunoObj.turma
                                    });
                                }
                            }
                        }
                    });
                });

                if (retornosHoje.length === 0) {
                    tbodyRetornoSuspensao.innerHTML = '<tr><td colspan="4" class="text-center" style="color: #059669; font-weight: 500; padding:1.5rem;"><i class="ph ph-check-circle" style="font-size:1.5rem; vertical-align:middle; margin-right:4px;"></i> Não há alunos com retorno programado para hoje.</td></tr>';
                } else {
                    tbodyRetornoSuspensao.innerHTML = '';
                    retornosHoje.forEach(r => {
                        // Verificar o comparecimento do aluno na Frequência de hoje
                        let statusRetorno = 'Pendente de Chamada';
                        let corStatus = '#64748B';
                        let bdgColor = '#F1F5F9';
                        
                        // Busca se a chamada da turma dele já foi feita hoje e o status de Entrada (E)
                        if (dadosFreq[hojeStr] && dadosFreq[hojeStr][r.turma] && dadosFreq[hojeStr][r.turma][r.cpf]) {
                            const reg = dadosFreq[hojeStr][r.turma][r.cpf];
                            if (reg.e === 'P') {
                                statusRetorno = 'Retornou (Presente)';
                                corStatus = '#059669'; // verde
                                bdgColor = '#D1FAE5';
                            } else if (reg.e === 'F' || reg.e === 'FJ') {
                                statusRetorno = 'Faltou no Retorno';
                                corStatus = '#DC2626'; // vermelho
                                bdgColor = '#FEE2E2';
                            }
                        } else {
                            // Chamada ainda não preenchida
                            statusRetorno = 'Sem dados de chamada';
                            corStatus = '#D97706'; // amarelo pendente
                            bdgColor = '#FEF3C7';
                        }

                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td><strong style="color: #1E293B;">${r.aluno}</strong></td>
                            <td><span class="badge" style="background:#E2E8F0; color:#475569;">${r.turma}</span></td>
                            <td class="text-center">
                                <span class="badge" style="background:${bdgColor}; color:${corStatus}; font-weight: 600;">${statusRetorno}</span>
                            </td>
                            <td class="text-right">
                                <button class="btn-outline" style="border-color:${corStatus}; color:${corStatus}; padding: 0.25rem 0.75rem; font-size: 0.8rem;" onclick="alert('Funcionalidade de alerta direto em breve!')">
                                    <i class="ph ph-bell-ringing"></i> Alertar Falha
                                </button>
                            </td>
                        `;
                        tbodyRetornoSuspensao.appendChild(tr);
                    });
                }
            }
        } // fecha o bloco if principal do dashboard
    } // fecha função atualizarDashboard

    // Inicialização final do app
    atualizarDashboard();

    // ==========================================
    // 12. CENTRAL DE EXPORTAÇÃO DE RELATÓRIOS (CSV)
    // ==========================================
    const btnExportAlunos = document.getElementById('btn-export-alunos');
    const btnExportFreq = document.getElementById('btn-export-freq');
    const btnExportOcorrencias = document.getElementById('btn-export-ocorrencias');

    function downloadCSV(csvContent, fileName) {
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    if (btnExportAlunos) {
        btnExportAlunos.addEventListener('click', () => {
            const dadosAlunos = JSON.parse(localStorage.getItem('rvs_alunos_cadastrados')) || [];
            if (dadosAlunos.length === 0) return alert('Não há alunos cadastrados para exportar.');
            
            let csv = "RA;Nome do Aluno;Turma;CPF;Idade;CEP;Email\n";
            dadosAlunos.forEach(a => {
                csv += `${a.ra || ''};${a.aluno || ''};${a.turma || ''};${a.cpf || ''};${a.idade || ''};${a.cep || ''};${a.email || ''}\n`;
            });
            downloadCSV(csv, `RVS_Alunos_Base_${new Date().toISOString().split('T')[0]}.csv`);
        });
    }

    if (btnExportFreq) {
        btnExportFreq.addEventListener('click', () => {
            const dadosFreq = JSON.parse(localStorage.getItem('rvs_frequencia')) || {};
            const dadosAlunos = JSON.parse(localStorage.getItem('rvs_alunos_cadastrados')) || [];
            
            const matriz = {};
            let registrosContados = 0;

            Object.keys(dadosFreq).forEach(dataLetiva => {
                const parts = dataLetiva.split('-');
                if (parts.length !== 3) return;
                
                const ano = parts[0];
                const mes = parts[1];
                const dia = parts[2];
                const mesAno = `${mes}/${ano}`;

                const turmas = dadosFreq[dataLetiva];
                Object.keys(turmas).forEach(turmaId => {
                    const alunosObj = turmas[turmaId];
                    Object.keys(alunosObj).forEach(cpf => {
                        registrosContados++;
                        const rec = alunosObj[cpf];
                        const key = `${mesAno}_${turmaId}_${cpf}`;
                        
                        let status = '-';
                        if (rec.e === 'FJ' || rec.s === 'FJ') {
                            status = 'FJ';
                        } else if (rec.e === 'P') {
                            status = 'P';
                        } else if (rec.e === 'F') {
                            status = 'F';
                        }
                        
                        if (!matriz[key]) {
                            const alunoNome = (dadosAlunos.find(a => a.cpf === cpf) || {aluno: 'Desconhecido'}).aluno;
                            matriz[key] = {
                                aluno: alunoNome,
                                turma: turmaId,
                                mesAno: mesAno,
                                dias: {}
                            };
                        }
                        matriz[key].dias[dia] = status;
                    });
                });
            });

            if (registrosContados === 0) return alert('Nenhum dado de frequência foi consolidado no sistema para exportar.');

            let csv = "Mês/Ano;Turma;Nome do Aluno;";
            for (let i = 1; i <= 31; i++) {
                csv += `Dia ${i};`;
            }
            csv += "Total Presenças;Total Faltas;Total Faltas Justificadas;% Presença;% Faltas\n";

            Object.values(matriz).forEach(row => {
                let p = 0, f = 0, fj = 0;
                let linhaStr = `${row.mesAno};${row.turma};${row.aluno};`;
                
                for (let i = 1; i <= 31; i++) {
                    const dStr = String(i).padStart(2, '0');
                    const val = row.dias[dStr];
                    if (val) {
                        linhaStr += `${val};`;
                        if (val === 'P') p++;
                        if (val === 'F') f++;
                        if (val === 'FJ') fj++;
                    } else {
                        linhaStr += `-;`;
                    }
                }
                
                const contagemTotal = p + f + fj;
                const percP = contagemTotal > 0 ? ((p / contagemTotal) * 100).toFixed(1) : 0;
                const percF = contagemTotal > 0 ? (((f + fj) / contagemTotal) * 100).toFixed(1) : 0;
                
                csv += `${linhaStr}${p};${f};${fj};${percP}%;${percF}%\n`;
            });

            downloadCSV(csv, `RVS_Planilha_Master_Frequencias_${new Date().toISOString().split('T')[0]}.csv`);
        });
    }

    if (btnExportOcorrencias) {
        btnExportOcorrencias.addEventListener('click', () => {
            const ocorrencias = JSON.parse(localStorage.getItem('rvs_ocorrencias')) || {};
            const dadosAlunos = JSON.parse(localStorage.getItem('rvs_alunos_cadastrados')) || [];
            let csv = "CPF;Nome do Aluno;Turma;DataeHora;Tipo;Cientes_Familia;Motivo;Autor_Registro\n";
            let registros = 0;
            
            Object.keys(ocorrencias).forEach(cpf => {
                const arrayOc = ocorrencias[cpf];
                const alunoInfo = dadosAlunos.find(a => a.cpf === cpf) || {aluno: 'Desconhecido', turma: '-'};
                
                arrayOc.forEach(oc => {
                    const clnMotivo = (oc.motivo||'').replace(/(\r\n|\n|\r)/gm," ");
                    csv += `${cpf};${alunoInfo.aluno};${alunoInfo.turma};${oc.dataHora};${oc.tipo};${oc.comunicar};${clnMotivo};${oc.autor}\n`;
                    registros++;
                });
            });
            
            if (registros === 0) return alert('Nenhuma ocorrência disciplinar registrada.');
            downloadCSV(csv, `RVS_Ocorrencias_Disciplinares_${new Date().toISOString().split('T')[0]}.csv`);
        });
    }

    // ==========================================
    // 13. MÓDULO WHATSAPP WEB
    // ==========================================
    const zapDestinatario = document.getElementById('zap-destinatario');
    
    // As variáveis abaixo já foram declaradas no Bloco 5 lá em cima na linha ~160.
    // Vamos apenas amarrar os listeners a elas diretamente.
    // zapTexto, dropZone, previewZone, dropContent, previewImg, btnRemoveFile já existem!
    
    const btnEnviarZap = document.getElementById('btn-enviar-zap');
    
    // Simulador de Anexos Drop-zone
    const zapAnexo = document.getElementById('zap-anexo');
    const fileNameSpan = document.getElementById('file-name');

    if (dropZone && zapAnexo) {
        dropZone.addEventListener('click', () => zapAnexo.click());
        
        zapAnexo.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    if (file.type.startsWith('image/')) {
                        previewImg.src = e.target.result;
                        previewImg.style.display = 'block';
                    } else {
                        // Icone PDF genérico se não for imagem
                        previewImg.src = 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg';
                        previewImg.style.display = 'block';
                    }
                    fileNameSpan.textContent = file.name;
                    
                    dropContent.classList.add('hidden');
                    previewZone.classList.remove('hidden');
                }
                reader.readAsDataURL(file);
            }
        });

        btnRemoveFile.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede abrir o input file de novo
            zapAnexo.value = '';
            dropContent.classList.remove('hidden');
            previewZone.classList.add('hidden');
        });
    }

    if (btnEnviarZap) {
        btnEnviarZap.addEventListener('click', () => {
            const text = zapTexto.value.trim();
            const destinatario = zapDestinatario.value;
            
            if (!text) return alert('Por favor, redija um comunicado antes de enviar.');
            
            // Tratamento do Destinatario Simbólico
            let infoExtra = '';
            if(destinatario === 'individual'){
                const profAluno = prompt("Digite o NOME ou CPF do aluno que deseja comunicar:");
                if(!profAluno) return;
                infoExtra = "*Aviso direcionado ao aluno/responsável: " + profAluno + "*\n\n";
            } else if(destinatario === 'turma'){
                 const profTurma = prompt("Digite a MÁSCARA DA TURMA (Ex: M1MNM01):");
                 if(!profTurma) return;
                 infoExtra = "*Comunicado Geral à Turma " + profTurma + "*\n\n";
            }
            
            const fullMessage = infoExtra + text;
            
            // Em aplicação real, você direcionaria contatos via array. 
            // Como demonstração Web-Share, enviamos você ao painel master do Zap Desktop/Web ou compartilhador
            const zapUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
            window.open(zapUrl, '_blank');
        });
    }

    // Inicialização Geral
    if (typeof atualizarSelectTurmas === 'function') atualizarSelectTurmas();
    if (typeof renderizarTabelaAlunos === 'function') renderizarTabelaAlunos();
    if (typeof atualizarDashboard === 'function') atualizarDashboard();
    if (typeof renderCalendar === 'function') renderCalendar();
    
});
