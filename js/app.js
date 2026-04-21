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
        setTimeout(() => { if (typeof window.aplicarPermissoes === 'function') window.aplicarPermissoes(); }, 100);
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailBox = document.getElementById('login-email').value.trim();
        const passBox = document.getElementById('login-password').value.trim();
        
        let validUser = null;

        if (emailBox === 'manager@admin.com' && passBox === '123') {
            validUser = { email: emailBox, role: 'manager', nome: 'Gestor Administrativo' };
        } else if (emailBox === 'prof@admin.com' && passBox === '123') {
            validUser = { email: emailBox, role: 'professor', nome: 'Professor Titular' };
        } else if (emailBox === 'dhenison@admin.com' && passBox === '123456') { // Mock legado suportado
            validUser = { email: emailBox, role: 'manager', nome: 'Dhenison (Super Admin)' };
        }
        
        if (!validUser) {
            alert('Acesso negado. Use manager@admin.com (123) ou prof@admin.com (123).');
            return;
        }

        // Simular um loading
        const btn = document.getElementById('btn-login');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Entrando...';
        
        setTimeout(() => {
            // Salvar credencial logada
            localStorage.setItem('rvs_logged', 'true');
            localStorage.setItem('rvs_usuarioAtivo', JSON.stringify(validUser));
            
            // Esconder login, mostrar App
            loginView.classList.remove('view-active');
            loginView.classList.add('view-hidden');
            
            appView.classList.remove('view-hidden');
            appView.classList.add('view-active');
            
            btn.innerHTML = originalText;
            aplicarPermissoes();
        }, 800);
    });

    window.aplicarPermissoes = function() {
        let userStr = localStorage.getItem('rvs_usuarioAtivo');
        let user;
        
        if (!userStr) {
            // Conta legada logada sem role
            user = { role: 'manager', nome: 'Admin Escola', email: 'dhenison@admin.com' };
            localStorage.setItem('rvs_usuarioAtivo', JSON.stringify(user));
        } else {
            try {
                user = JSON.parse(userStr);
            } catch(e) {
                user = { role: 'manager', nome: 'Admin Escola', email: 'dhenison@admin.com' };
            }
        }
        
        // Aplica cabeçalho de perfil
        const headerAvatar = document.querySelector('#header-avatar');
        if (headerAvatar) {
            headerAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=1E3A8A&color=fff`;
            const headerDesc = headerAvatar.nextElementSibling;
            if(headerDesc) {
                headerDesc.innerHTML = `<div class="fw-semibold small">${user.nome}</div><div class="text-body-secondary" style="font-size: 0.75rem;">${user.role === 'manager' ? 'Diretoria' : 'Logado como Professor'}</div>`;
            }
        }

        const btnAcoes = document.getElementById('btn-acoes-globais');
        
        // Aplica trava de rotas e botões
        if (user.role !== 'manager') {
            const targetsEsconder = ['dashboard', 'turmas', 'whatsapp', 'relatorios', 'permissoes'];
            document.querySelectorAll('.nav-link').forEach(link => {
                const alvo = link.getAttribute('data-target');
                if(targetsEsconder.includes(alvo)) {
                    link.style.display = 'none';
                }
            });
            // Esconde botão global de dashboards do Manager
            if (btnAcoes) btnAcoes.style.display = 'none';
            
            // Força ida para a Frequência se o Dashboard for a tela ativa (professores)
            setTimeout(() => {
                const freqBtn = document.querySelector('.nav-link[data-target="frequencia"]');
                if(freqBtn && document.getElementById('dashboard').classList.contains('section-active')) {
                    freqBtn.click();
                }
            }, 150);
        } else {
            if (btnAcoes) {
                btnAcoes.style.display = 'flex';
                btnAcoes.innerHTML = '<i class="ph ph-gear"></i> Configurar Bimestres';
                btnAcoes.onclick = () => alert('Tela de Configuração de Bimestres será implementada.');
            }
        }
    };

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
    // 7. GESTÃO DE ALUNOS (CADASTRO E IMPORTAÇÃO)
    // ==========================================
    const btnImportarAlunos = document.getElementById('btn-importar-alunos');
    const inputImportarAlunos = document.getElementById('input-importar-alunos');
    const tbodyAlunos = document.getElementById('lista-alunos-tbody');
    const selectTurmaAlunos = document.getElementById('select-turma-alunos');
    const searchNomeAlunos = document.getElementById('search-nome-alunos');
    
    // Novo Aluno
    const btnNovoAluno = document.getElementById('btn-novo-aluno');
    const modalNovoAluno = document.getElementById('novo-aluno-modal');
    
    if (btnNovoAluno && modalNovoAluno) {
        btnNovoAluno.addEventListener('click', () => {
            modalNovoAluno.classList.remove('hidden');
        });

        const fecharModalNovoAluno = () => {
            modalNovoAluno.classList.add('hidden');
            document.getElementById('form-novo-aluno').reset();
        };

        document.getElementById('btn-close-novo-aluno')?.addEventListener('click', fecharModalNovoAluno);
        document.getElementById('btn-cancel-novo-aluno')?.addEventListener('click', fecharModalNovoAluno);

        document.getElementById('btn-save-novo-aluno')?.addEventListener('click', (e) => {
            e.preventDefault();
            const nome = document.getElementById('novo-aluno-nome').value.trim();
            const cpf = document.getElementById('novo-aluno-cpf').value.trim();
            const turma = document.getElementById('novo-aluno-turma').value.trim().toUpperCase();
            const fileInput = document.getElementById('novo-aluno-foto');
            
            if(!nome || !cpf || !turma) return alert("Preencha Nome, CPF e Turma!");

            const alunoObj = {
                cpf, aluno: nome, turma, dataNasc: '', idade: '', email: '', nomePai: '', nomeMae: '', telefone: '', senha: '',
                initials: nome.substring(0, 2).toUpperCase(),
                avatarBg: "#F8FAFC",
                avatarColor: "#1E3A8A"
            };

            const salvarNaQueue = (base64Img) => {
                const dadosEvt = { ...alunoObj, fotoBase64: base64Img || "" };
                alunosCadastrados.push(alunoObj);
                localStorage.setItem('rvs_alunos_cadastrados', JSON.stringify(alunosCadastrados));
                
                let syncQueue = JSON.parse(localStorage.getItem('rvs_sync_queue')) || [];
                syncQueue.push({
                    tipo: "NOVO_ALUNO",
                    dados: dadosEvt,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('rvs_sync_queue', JSON.stringify(syncQueue));
                
                fecharModalNovoAluno();
                atualizarSelectTurmas();
                renderizarTabelaAlunos();
                if (navigator.onLine && typeof syncPendingData === 'function') syncPendingData();
            };

            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (evt) => salvarNaQueue(evt.target.result);
                reader.readAsDataURL(fileInput.files[0]);
            } else if (window.tempNovoAlunoBase64) {
                salvarNaQueue(window.tempNovoAlunoBase64);
                window.tempNovoAlunoBase64 = null; // Consume Cache
                const prw = document.getElementById('novo-aluno-preview-container');
                if(prw) prw.style.display = 'none';
            } else {
                salvarNaQueue("");
            }
        });
    }
    
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
                    <a href="#" onclick="window.abrirFichaAluno('${aluno.cpf}'); return false;" class="student-row text-decoration-none">
                        <div class="student-avatar shadow-sm" style="background:${aluno.avatarBg};color:${aluno.avatarColor};border:1px solid #E2E8F0;">${aluno.initials}</div>
                        <span class="student-name fw-semibold">${aluno.aluno}</span>
                    </a>
                </td>
                <td><span class="badge" style="background:#FEF3C7; color:#D97706;">${aluno.turma}</span></td>
                <td>${aluno.email}</td>
                <td class="text-right">
                    <button class="btn-icon text-primary" onclick="window.abrirFichaAluno('${aluno.cpf}')" title="Dossiê do Aluno"><i class="ph ph-identification-card"></i></button>
                    <button class="btn-icon text-danger" onclick="window.removerAluno('${aluno.cpf}')" title="Excluir Aluno"><i class="ph ph-trash"></i></button>
                    <button class="btn-icon btn-outline btn-sm" onclick="window.abrirModalTransferencia('${aluno.cpf}')" title="Transferir de Turma"><i class="ph ph-arrows-left-right"></i></button>
                </td>
            `;
            tbodyAlunos.appendChild(tr);
        });
    }

    window.abrirFichaAluno = function(cpf) {
        const aluno = alunosCadastrados.find(a => a.cpf === cpf);
        if(!aluno) return;
        
        // 1. Dados Básicos do Cabeçalho
        document.getElementById('ficha-nome').textContent = aluno.aluno;
        document.getElementById('ficha-turma').textContent = aluno.turma;
        document.getElementById('ficha-cpf').textContent = aluno.cpf;
        
        // Gerando matrícula pseudo-real baseada no sistema ou timestamp
        const matricula = aluno.matricula || (new Date().getFullYear()) + cpf.replace(/\D/g, '').substring(0,6);
        document.getElementById('ficha-matricula').textContent = matricula;

        // Foto com fallback Câmera/Placeholder
        document.getElementById('ficha-foto').src = aluno.fotoBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(aluno.aluno)}&size=90&background=1E3A8A&color=fff`;

        // Aba: VISÃO GERAL (Informações)
        document.getElementById('ficha-idade').textContent = aluno.dataNasc ? calcularIdade(aluno.dataNasc) : (aluno.idade || '--');
        document.getElementById('ficha-email').textContent = aluno.email || '--';
        document.getElementById('ficha-tel').textContent = aluno.telefone || '--';
        document.getElementById('ficha-mae').textContent = aluno.nomeMae || '--';
        document.getElementById('ficha-pai').textContent = aluno.nomePai || '--';
        document.getElementById('ficha-endereco').textContent = aluno.endereco || '--';

        // 2. Extrator de Frequência (Anual e Bimestral)
        const dbFreq = JSON.parse(localStorage.getItem('rvs_frequencia')) || {};
        let historicoCompleto = []; 

        Object.keys(dbFreq).forEach(keyDia => {
            const turmasDia = dbFreq[keyDia];
            Object.keys(turmasDia).forEach(turmaVar => {
                if (turmasDia[turmaVar][aluno.cpf]) {
                    const reg = turmasDia[turmaVar][aluno.cpf];
                    let finalConsolidado = 'P';
                    if (reg.e === 'FJ' || reg.s === 'FJ') finalConsolidado = 'FJ';
                    else if (reg.e === 'F' || reg.s === 'F') finalConsolidado = 'F';
                    
                    let temPA = (reg.e === 'PA' || reg.s === 'PA');
                    historicoCompleto.push({
                         dataObjStr: keyDia, 
                         reg: reg, 
                         finalConsolidado: finalConsolidado,
                         temPA: temPA
                    });
                }
            });
        });

        // TOTAIS CONSOLIDADOS DO ANO LETIVO
        let anoP = 0, anoF = 0, anoPA = 0, anoFJ = 0;
        historicoCompleto.forEach(h => {
             if (h.temPA) anoPA++;
             if (h.finalConsolidado === 'P') anoP++;
             if (h.finalConsolidado === 'F') anoF++;
             if (h.finalConsolidado === 'FJ') anoFJ++;
        });

        const domTotPAno = document.getElementById('dossie-tot-p-ano');
        if(domTotPAno) {
            domTotPAno.textContent = anoP;
            document.getElementById('dossie-tot-f-ano').textContent = anoF;
            document.getElementById('dossie-tot-pa-ano').textContent = anoPA;
            document.getElementById('dossie-tot-fj-ano').textContent = anoFJ;
        }

        // MOTOR DE RENDERIZAÇÃO BIMESTRAL
        function renderFrequenciaBimestre() {
            const domSelectBimestre = document.getElementById('dossie-filtro-bimestre');
            const biSelecionado = domSelectBimestre ? domSelectBimestre.value : getBimestreAtualRange(new Date()).id;
            const bDef = BIMESTRES_2026.find(b => b.id === String(biSelecionado)) || BIMESTRES_2026[0];
            
            let biP = 0, biF = 0, biPA = 0, biFJ = 0;
            let htmlFreq = '';

            historicoCompleto.forEach(h => {
                 // Filtra só as entradas que pertencem ao range do bimestre selecionado
                 if (h.dataObjStr >= bDef.inicio && h.dataObjStr <= bDef.fim) {
                     if (h.temPA) biPA++;
                     if (h.finalConsolidado === 'P') biP++;
                     if (h.finalConsolidado === 'F') biF++;
                     if (h.finalConsolidado === 'FJ') biFJ++;

                     // Renderiza log de anomalia (Qualquer coisa diferente da perfeição, exibe embaixo)
                     if (h.finalConsolidado !== 'P' || h.temPA) {
                          const dataSplited = h.dataObjStr.split('-');
                          const diaLegivel = dataSplited.length === 3 ? `${dataSplited[2]}/${dataSplited[1]}` : h.dataObjStr;
                          const makeSpan = (val) => {
                              if(val === 'F') return '<span class="text-danger fw-bold">Falta</span>';
                              if(val === 'PA') return '<span class="text-warning text-dark fw-bold">Atraso</span>';
                              if(val === 'FJ') return '<span class="text-info text-dark fw-bold">Justif.</span>';
                              return 'Presença';
                          };
                          htmlFreq += `<tr><td class="text-secondary fw-medium align-middle">${diaLegivel}</td><td class="align-middle">${makeSpan(h.reg.e)}</td><td class="align-middle">${makeSpan(h.reg.s)}</td></tr>`;
                     }
                 }
            });

            document.getElementById('dossie-tot-p').textContent = biP;
            document.getElementById('dossie-tot-f').textContent = biF;
            document.getElementById('dossie-tot-pa').textContent = biPA;
            document.getElementById('dossie-tot-fj').textContent = biFJ;

            const boxHistorico = document.getElementById('dossie-historico-freq');
            if (boxHistorico) {
                if (htmlFreq !== '') {
                    boxHistorico.innerHTML = htmlFreq;
                } else {
                    boxHistorico.innerHTML = `<tr><td colspan="3" class="text-center text-muted small py-3"><i class="ph ph-check-circle text-success fs-5"></i><br>Nenhum evento grave neste bimestre.</td></tr>`;
                }
            }
        }

        const domSelectBimestre = document.getElementById('dossie-filtro-bimestre');
        if (domSelectBimestre) {
             domSelectBimestre.value = getBimestreAtualRange(new Date()).id; // Auto Select dinâmico ao abrir a ficha
             domSelectBimestre.onchange = renderFrequenciaBimestre; // Repinta os cards azuis ao mudar
        }

        renderFrequenciaBimestre(); // Executa a pintura primária imediatamente

        // 3. Extrator de Ocorrências e Histórico Transferências
        const dbOcorrencias = JSON.parse(localStorage.getItem('rvs_ocorrencias')) || {};
        const ocorAluno = dbOcorrencias[aluno.cpf] || [];
        
        if (ocorAluno.length > 0) {
            let mkc = '';
            ocorAluno.forEach(o => {
                const dataDisplay = o.dataHora || o.data || 'Data N/A';
                const descricaoDisplay = o.motivo || o.descricao || 'Sem detalhes fornecidos.';
                mkc += `<div class="p-3 mb-2 border rounded border-danger border-opacity-50 bg-danger bg-opacity-10 text-danger text-start">
                    <div class="fw-bold"><i class="ph ph-warning"></i> ${dataDisplay} - ${o.tipo}</div>
                    <div class="small mt-1 text-dark">${descricaoDisplay}</div>
                </div>`;
            });
            document.getElementById('dossie-lista-ocorrencias').innerHTML = mkc;
        } else {
            document.getElementById('dossie-lista-ocorrencias').innerHTML = `<div class="text-center text-secondary py-4 bg-light rounded"><i class="ph ph-check-circle fs-1 text-success mb-2"></i><br>Nenhuma ocorrência atrelada a este aluno. Excelente.</div>`;
        }

        const histTransf = document.getElementById('lista-movimentacoes-dossie');
        if (aluno.historicoTurnos && aluno.historicoTurnos.length > 0) {
            histTransf.innerHTML = aluno.historicoTurnos.map(h => `<li class="list-group-item text-secondary py-2 small border-bottom"><i class="ph ph-arrows-left-right text-primary"></i> ${h}</li>`).join('');
        } else {
            histTransf.innerHTML = `<li class="list-group-item text-secondary py-1 text-center small border-0 bg-transparent">Nenhuma movimentação no ano.</li>`;
        }
        
        // Resetar aba default pra Visão Geral ao abrir
        const firstTabEl = document.querySelector('#dossie-tabs button[data-bs-target="#tab-dados"]');
        if (firstTabEl) new bootstrap.Tab(firstTabEl).show();

        document.getElementById('ficha-aluno-modal').classList.remove('hidden');
    };

    function calcularIdade(nascDateStr) {
        if (!nascDateStr) return '';
        const dob = new Date(nascDateStr);
        if (isNaN(dob)) return nascDateStr;
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms); 
        return Math.abs(age_dt.getUTCFullYear() - 1970) + ' anos';
    }

    // ==========================================
    // LÓGICA DE ATUALIZAÇÂO FOTO DO DOSSIÊ
    // ==========================================
    const btnCameraDossie = document.getElementById('btn-camera-dossie');
    const inputFotoDossie = document.getElementById('dossie-file-input');

    if (btnCameraDossie && inputFotoDossie) {
        btnCameraDossie.addEventListener('click', (e) => {
            e.preventDefault();
            inputFotoDossie.click();
        });

        inputFotoDossie.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const cpfAtual = document.getElementById('ficha-cpf').textContent;
            if (!cpfAtual) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => {
                    // Compressão max 800px equivalente à nossa câmera WebRTC nativa
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    let scale = 1;
                    if (img.width > MAX_WIDTH) {
                        scale = MAX_WIDTH / img.width;
                    }
                    canvas.width = Math.floor(img.width * scale);
                    canvas.height = Math.floor(img.height * scale);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    const base64Img = canvas.toDataURL('image/jpeg', 0.8);
                    
                    // 1. Atualizar UI Dinamicamente
                    document.getElementById('ficha-foto').src = base64Img;
                    
                    // 2. Atualizar Array em Memória
                    const alunoIdx = alunosCadastrados.findIndex(a => a.cpf === cpfAtual);
                    if (alunoIdx > -1) {
                        alunosCadastrados[alunoIdx].fotoBase64 = base64Img;
                        localStorage.setItem('rvs_alunos_cadastrados', JSON.stringify(alunosCadastrados));
                        
                        // 3. Renderizar na tabela que está por baixo da modal
                        renderizarTabelaAlunos();

                        // 4. Jogar na Fila de Sincronização conectada ao AppSheet / GAS
                        let syncQueue = JSON.parse(localStorage.getItem('rvs_sync_queue')) || [];
                        syncQueue.push({
                            tipo: "UPDATE_ALUNO",
                            dados: alunosCadastrados[alunoIdx],
                            timestamp: new Date().toISOString()
                        });
                        localStorage.setItem('rvs_sync_queue', JSON.stringify(syncQueue));
                        if (navigator.onLine && typeof window.syncPendingData === 'function') window.syncPendingData();
                    }
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
            inputFotoDossie.value = ''; // Reseta input para permitir re-seleção do mesmo arquivo caso mude ideia e erre
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
        
        // Fila de Sincronizacao
        let syncQueue = JSON.parse(localStorage.getItem('rvs_sync_queue')) || [];
        syncQueue.push({
            tipo: "TRANSFERENCIA",
            dados: {
                cpf: alunoEditandoTransferencia.cpf,
                de: turmaAntiga,
                para: novaTurma,
                dataHora: dataHoraFormatada
            },
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('rvs_sync_queue', JSON.stringify(syncQueue));
        
        // Tenta sincronizar agora se on-line
        if (navigator.onLine && typeof syncPendingData === 'function') syncPendingData();

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
            const eClsPA = entAtiva === 'PA' ? 'selected selected-pa' : '';
            
            // Classes para os botões S
            const sClsP = saiAtiva === 'P' ? 'selected selected-p' : '';
            const sClsF = saiAtiva === 'F' ? 'selected selected-f' : '';
            const sClsFJ = saiAtiva === 'FJ' ? 'selected selected-fj' : '';
            const sClsPA = saiAtiva === 'PA' ? 'selected selected-pa' : '';
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
                        <button class="btn-chamada ${eClsPA}" data-val="PA" data-tipo="E" data-cpf="${aluno.cpf}" style="color:#D97706; border-color:#FCD34D;">PA</button>
                    </div>
                    <div class="motivo-fj-container ${['FJ', 'PA'].includes(entAtiva) ? '' : 'hidden'} mt-1" id="fj-E-${aluno.cpf}">
                        <select class="input-select" style="padding: 0.2rem; font-size: 0.75rem; height: auto;">
                            <option value="">Motivo...</option>
                            <option value="Trânsito/Transporte" ${motivEnt === 'Trânsito/Transporte' ? 'selected' : ''}>Trânsito/Transporte</option>
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
                        <button class="btn-chamada ${sClsPA}" data-val="PA" data-tipo="S" data-cpf="${aluno.cpf}" style="color:#D97706; border-color:#FCD34D;">PA</button>
                    </div>
                    <div class="motivo-fj-container ${['FJ', 'PA'].includes(saiAtiva) ? '' : 'hidden'} mt-1" id="fj-S-${aluno.cpf}">
                        <select class="input-select" style="padding: 0.2rem; font-size: 0.75rem; height: auto;">
                            <option value="">Motivo...</option>
                            <option value="Trânsito/Transporte" ${motivSai === 'Trânsito/Transporte' ? 'selected' : ''}>Trânsito/Transporte</option>
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
                grupoBtns.forEach(b => b.classList.remove('selected', 'selected-p', 'selected-f', 'selected-fj', 'selected-pa'));
                
                // Add select class com base no valor
                btn.classList.add('selected');
                if (val === 'P') btn.classList.add('selected-p');
                if (val === 'F') btn.classList.add('selected-f');
                if (val === 'FJ') btn.classList.add('selected-fj');
                if (val === 'PA') btn.classList.add('selected-pa');
                
                const fjContainer = document.getElementById(`fj-${tipo}-${cpf}`);
                if (val === 'FJ' || val === 'PA') {
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
            spanStatus.style.background = '#E2E8F0';
            spanStatus.style.color = '#475569';
            return;
        }

        const eVal = entradaBtn.getAttribute('data-val');
        const sVal = saidaBtn.getAttribute('data-val');
        let final = '';

        if (eVal === 'FJ' || sVal === 'FJ') {
            final = 'P'; // A falta justificada anula a falta global
        } else if (eVal === 'F' || sVal === 'F') {
            final = 'F'; // Qualquer F puro, zera o status global (na escola estadual)
        } else if (eVal === 'PA' || sVal === 'PA') {
            final = 'PA';
        } else {
            final = 'P';
        }

        if (final === 'P') {
            spanStatus.className = 'badge badge-success consolidado-status';
            spanStatus.textContent = 'Presente';
            spanStatus.style.background = '#D1FAE5';
            spanStatus.style.color = '#059669';
        } else if (final === 'PA') {
            spanStatus.className = 'badge consolidado-status';
            spanStatus.textContent = 'Atraso';
            spanStatus.style.background = '#FEF3C7';
            spanStatus.style.color = '#D97706';
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

             // Adicionar à fila de sincronização (Salvamento Híbrido)
             let queue = JSON.parse(localStorage.getItem('rvs_sync_queue')) || [];
             queue.push({
                 tipo: "FREQUENCIA",
                 dados: {
                     date: dateStr,
                     turma: turma,
                     alunos: freqAll[dateStr][turma]
                 },
                 timestamp: new Date().toISOString()
             });
             localStorage.setItem('rvs_sync_queue', JSON.stringify(queue));

             statusConsolidacao.textContent = `Salvo localmente: Frequência do dia ${dateStr.split('-').reverse().join('/')} validada.`;
             statusConsolidacao.style.color = '#059669';
             if (typeof atualizarDashboard === 'function') atualizarDashboard();
             
             // Tenta sincronizar agora se estiver online
             if (navigator.onLine && typeof syncPendingData === 'function') {
                 syncPendingData();
             } else {
                 alert('Chamada salva no celular! Será sincronizada quando houver conexão.');
             }
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
            
            // Fila de Sincronização
            let syncQueue = JSON.parse(localStorage.getItem('rvs_sync_queue')) || [];
            syncQueue.push({
                tipo: "OCORRENCIA",
                dados: {
                    cpf: cpf,
                    turma: selectTurmaOcor.value,
                    dataHora, tipo, comunicar, motivo, dataInicio, dataRetorno
                },
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('rvs_sync_queue', JSON.stringify(syncQueue));
            
            // Tenta sincronizar agora se on-line
            if (navigator.onLine && typeof syncPendingData === 'function') syncPendingData();
            
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
    const BIMESTRES_2026 = [
        { id: '1', nome: '1º Bimestre', inicio: '2026-02-03', fim: '2026-04-18' },
        { id: '2', nome: '2º Bimestre', inicio: '2026-04-22', fim: '2026-06-30' },
        { id: '3', nome: '3º Bimestre', inicio: '2026-08-01', fim: '2026-09-30' },
        { id: '4', nome: '4º Bimestre', inicio: '2026-10-01', fim: '2026-12-20' }
    ];

    function getBimestreAtualRange(dataObj) {
        const d = dataObj.toISOString().split('T')[0];
        for (let b of BIMESTRES_2026) {
            if (d >= b.inicio && d <= b.fim) return b;
        }
        if (d < '2026-02-03') return BIMESTRES_2026[0];
        if (d > '2026-12-20') return BIMESTRES_2026[3];
        if (d > '2026-06-30' && d < '2026-08-01') return BIMESTRES_2026[2]; // Férias jul
        return BIMESTRES_2026[0];
    }

    function getTurnoFromTurma(turmaStr) {
        if(!turmaStr) return 'ALL';
        if(turmaStr.startsWith('M1MN') || turmaStr.startsWith('M2MN') || turmaStr.startsWith('M3MN')) return 'M';
        if(turmaStr.startsWith('M1TN') || turmaStr.startsWith('M2TN') || turmaStr.startsWith('M3TN')) return 'T';
        if(turmaStr.startsWith('M1NN') || turmaStr.startsWith('M2NN') || turmaStr.startsWith('M3NN') || turmaStr.startsWith('M1NNJ') || turmaStr.startsWith('M2NNJ') || turmaStr.startsWith('M1CF')) return 'N';
        return 'ALL';
    }

    let dashChartInstance = null;

    function atualizarDashboard() {
        const filtroTurnoDom = document.getElementById('dash-filtro-turno');
        const turnoSelecionado = filtroTurnoDom ? filtroTurnoDom.value : 'ALL';
        
        const filtroBimDom = document.getElementById('dash-filtro-bimestre');
        let biSelecionado = filtroBimDom ? filtroBimDom.value : getBimestreAtualRange(new Date()).id;
        
        // Auto-selecionar Bimestre Padrão no primeiro Load
        if (filtroBimDom && filtroBimDom.value === '') {
            biSelecionado = getBimestreAtualRange(new Date()).id;
            filtroBimDom.value = biSelecionado;
        }

        const badge = document.getElementById('dash-badge-bimestre');
        if (badge) {
            if (biSelecionado === 'ALL') {
                badge.innerHTML = `<i class="ph ph-calendar"></i> Visão Global Anual`;
                badge.className = "badge bg-dark fs-6 py-2 px-3 me-2 border border-secondary border-opacity-50";
            } else {
                badge.innerHTML = `<i class="ph ph-calendar"></i> Seleção: ${biSelecionado}º Bimestre`;
                badge.className = "badge bg-primary fs-6 py-2 px-3 me-2 shadow-sm";
            }
        }

        // Obter bases de dados globais
        const dadosAlunos = JSON.parse(localStorage.getItem('rvs_alunos_cadastrados')) || [];
        const dadosFreq = JSON.parse(localStorage.getItem('rvs_frequencia')) || {};
        const dadosOcorrencias = JSON.parse(localStorage.getItem('rvs_ocorrencias')) || {};

        // Filtrar Alunos pelo Turno
        const alunosFiltrados = turnoSelecionado === 'ALL' 
            ? dadosAlunos 
            : dadosAlunos.filter(a => getTurnoFromTurma(a.turma) === turnoSelecionado);

        const cpfsNoTurno = alunosFiltrados.map(a => a.cpf);
        const turmasNoTurno = [...new Set(alunosFiltrados.map(a => a.turma))];

        let datasDisponiveis = Object.keys(dadosFreq).sort();
        
        // CORTAR DATAS PELO BIMESTRE
        if (biSelecionado !== 'ALL') {
            const bDef = BIMESTRES_2026.find(b => b.id === String(biSelecionado));
            if (bDef) {
                 datasDisponiveis = datasDisponiveis.filter(d => d >= bDef.inicio && d <= bDef.fim);
            }
        }

        // ==========================================
        // 1. STATUS DE LANÇAMENTO (Hoje - Independe do Bimestre Análise Básica)
        // ==========================================
        const hojeStr = new Date().toISOString().split('T')[0];
        const totalTurmasTrabalhando = turmasNoTurno.length;
        let turmasLancadasHoje = 0;

        if (dadosFreq[hojeStr]) {
            turmasNoTurno.forEach(t => {
                if (dadosFreq[hojeStr][t]) turmasLancadasHoje++;
            });
        }

        const domStatusLancamento = document.getElementById('dash-status-lancamento');
        if (domStatusLancamento) domStatusLancamento.textContent = `${turmasLancadasHoje}/${totalTurmasTrabalhando}`;

        // ==========================================
        // 2. HOJE VS. MÉDIA HISTÓRICA DO PERÍODO
        // ==========================================
        let totalFaltasHistorico = 0;
        let totalDiasHistorico = datasDisponiveis.length;

        // Acumula faltas no histórico do turno
        datasDisponiveis.forEach(dataKey => {
            Object.keys(dadosFreq[dataKey]).forEach(turmaKey => {
                if (turnoSelecionado === 'ALL' || getTurnoFromTurma(turmaKey) === turnoSelecionado) {
                    Object.values(dadosFreq[dataKey][turmaKey]).forEach(reg => {
                        const final = (reg.e === 'F' || reg.s === 'F') ? 'F' : 'P';
                        if (final === 'F') totalFaltasHistorico++;
                    });
                }
            });
        });

        // Faltas de Hoje
        let faltasHoje = 0;
        if (dadosFreq[hojeStr]) {
            Object.keys(dadosFreq[hojeStr]).forEach(turmaKey => {
                if (turnoSelecionado === 'ALL' || getTurnoFromTurma(turmaKey) === turnoSelecionado) {
                    Object.values(dadosFreq[hojeStr][turmaKey]).forEach(reg => {
                        const final = (reg.e === 'F' || reg.s === 'F') ? 'F' : 'P';
                        if (final === 'F') faltasHoje++;
                    });
                }
            });
        }

        const mediaGeralDiaria = totalDiasHistorico > 0 ? (totalFaltasHistorico / totalDiasHistorico) : 0;
        const diferencaFaltas = mediaGeralDiaria > 0 ? ((faltasHoje - mediaGeralDiaria) / mediaGeralDiaria) * 100 : 0;

        const domMedia = document.getElementById('dash-media-faltas-val');
        const domMediaTxt = document.getElementById('dash-media-faltas-txt');
        const domMediaIco = document.getElementById('icone-media-faltas');
        
        if (domMedia && domMediaTxt) {
            if (totalDiasHistorico === 0 || !dadosFreq[hojeStr] || turmasLancadasHoje === 0) {
                domMedia.textContent = '--';
                domMediaTxt.textContent = "Aguardando chamadas oficiais...";
                domMediaIco.className = "ph ph-clock-counter-clockwise fs-3 text-secondary";
            } else {
                const perc = Math.abs(Math.round(diferencaFaltas));
                if (diferencaFaltas > 0) {
                    domMedia.textContent = `+${perc}% Faltas`;
                    domMedia.classList.add('text-danger');
                    domMedia.classList.remove('text-success');
                    domMediaTxt.textContent = "Acima da média geral do turno";
                    domMediaIco.className = "ph ph-trend-up fs-3 text-danger";
                } else if (diferencaFaltas < 0) {
                    domMedia.textContent = `-${perc}% Faltas`;
                    domMedia.classList.remove('text-danger');
                    domMedia.classList.add('text-success');
                    domMediaTxt.textContent = "Abaixo (Melhor) que a média";
                    domMediaIco.className = "ph ph-trend-down fs-3 text-success";
                } else {
                    domMedia.textContent = "Estável";
                    domMedia.classList.remove('text-danger', 'text-success');
                    domMediaIco.className = "ph ph-minus fs-3 text-secondary";
                    domMediaTxt.textContent = "Dentro da média padrão do turno";
                }
            }
        }

        // ==========================================
        // 3. GRÁFICO DE TENDÊNCIA (Últimos 7 dias)
        // ==========================================
        const ctx = document.getElementById('dash-chart');
        if (ctx && window.Chart) {
            const ultimos7Dias = datasDisponiveis.slice(-7);
            const labelsData = [];
            const pontosDataFaltas = [];

            ultimos7Dias.forEach(d => {
                const dSplited = d.split('-');
                labelsData.push(`${dSplited[2]}/${dSplited[1]}`);
                
                let fNoDia = 0;
                Object.keys(dadosFreq[d]).forEach(tk => {
                    if(turnoSelecionado === 'ALL' || getTurnoFromTurma(tk) === turnoSelecionado) {
                         Object.values(dadosFreq[d][tk]).forEach(reg => {
                             if(reg.e === 'F' || reg.s === 'F') fNoDia++;
                         });
                    }
                });
                pontosDataFaltas.push(fNoDia);
            });

            if (dashChartInstance) {
                dashChartInstance.destroy();
            }

            dashChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labelsData,
                    datasets: [{
                        label: 'Faltas Registradas',
                        data: pontosDataFaltas,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#1E3A8A'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { borderDash: [2, 4] } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // ==========================================
        // 4. ALERTA CRÍTICO: Risco de Evasão (20% ou 3 Consecutivas)
        // ==========================================
        const tbodyEvasao = document.getElementById('dash-evasao-tbody');
        if (tbodyEvasao) {
            let vulneraveis = [];
            // Base de letivos bimestral = 50 dias (20% = 10 faltas)
            // Se tiver olhando pro ano todo (ALL), usa métrica bruta de 40 faltas
            const limiteFaltas = biSelecionado === 'ALL' ? 40 : 10; 

            alunosFiltrados.forEach(al => {
                let historicoAluno = [];
                // Reconstruir linha do tempo do aluno recém fatiada
                datasDisponiveis.forEach(d => {
                    let statusDia = 'P'; // Default
                    if (dadosFreq[d] && dadosFreq[d][al.turma] && dadosFreq[d][al.turma][al.cpf]) {
                        const reg = dadosFreq[d][al.turma][al.cpf];
                        if (reg.e === 'F' || reg.s === 'F') statusDia = 'F';
                        else if (reg.e === 'FJ' || reg.s === 'FJ') statusDia = 'FJ';
                        else if (reg.e === 'PA' || reg.s === 'PA') statusDia = 'PA';
                    } else {
                        statusDia = null; // Não houve chamada
                    }
                    if (statusDia !== null) historicoAluno.push(statusDia);
                });

                const totaisGlobaisF = historicoAluno.filter(h => h === 'F').length;
                // Contagem consecutivas recentes
                let consecutivasRecentes = 0;
                for (let i = historicoAluno.length - 1; i >= 0; i--) {
                    if (historicoAluno[i] === 'F') consecutivasRecentes++;
                    else if (historicoAluno[i] !== 'FJ') break;
                }

                if (totaisGlobaisF >= limiteFaltas || consecutivasRecentes >= 3) {
                    let mot = totaisGlobaisF >= limiteFaltas ? 'Estourou 20%' : 'Falta Consecutiva (>3)';
                    vulneraveis.push({ aluno: al.aluno, cpf: al.cpf, turma: al.turma, totalF: totaisGlobaisF, motivo: mot });
                }
            });

            vulneraveis.sort((a,b) => b.totalF - a.totalF);

            if (vulneraveis.length === 0) {
                tbodyEvasao.innerHTML = '<tr><td colspan="4" class="text-center" style="color: #059669; font-weight: 500; padding:1.5rem;"><i class="ph ph-check-circle fs-3 align-middle me-2"></i> Nenhum aluno detectado na malha crítica.</td></tr>';
            } else {
                tbodyEvasao.innerHTML = '';
                vulneraveis.slice(0, 10).forEach(v => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong class="text-dark border-0 p-0 text-decoration-none">${v.aluno}</strong></td>
                        <td><span class="badge bg-light text-secondary border border-secondary border-opacity-25">${v.turma}</span></td>
                        <td class="text-center">
                            <span class="fw-bold ${v.motivo.includes('25') ? 'text-danger' : 'text-warning text-dark'}">${v.totalF} dias (${v.motivo})</span>
                        </td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-outline-primary shadow-sm rounded-pill" onclick="window.abrirFichaAluno('${v.cpf}')">Dossiê</button>
                        </td>
                    `;
                    tbodyEvasao.appendChild(tr);
                });
            }
        }

        // ==========================================
        // 5. EVENTOS RECENTES (Ocorrências e Atrasos)
        // ==========================================
        const painelEventos = document.getElementById('dash-recent-events');
        if (painelEventos) {
            let eventosMistos = [];
            // Coletar Ocorrências Ativas do Turno
            Object.keys(dadosOcorrencias).forEach(cpfRec => {
                const alObj = dadosAlunos.find(a => a.cpf === cpfRec);
                if (alObj && (turnoSelecionado === 'ALL' || getTurnoFromTurma(alObj.turma) === turnoSelecionado)) {
                    dadosOcorrencias[cpfRec].forEach(oc => {
                        eventosMistos.push({ dataStr: oc.dataHora || oc.data, type: 'OCOR', icon: 'ph-warning', cor: 'danger', desc: oc.tipo, nome: alObj.aluno, cpf: alObj.cpf });
                    });
                }
            });

            // Coletar Últimos Atrasos (Apenas dos últimos 3 dias pra não poluir)
            datasDisponiveis.slice(-3).forEach(d => {
                Object.keys(dadosFreq[d]).forEach(tk => {
                    if (turnoSelecionado === 'ALL' || getTurnoFromTurma(tk) === turnoSelecionado) {
                        Object.keys(dadosFreq[d][tk]).forEach(cpf => {
                            const reg = dadosFreq[d][tk][cpf];
                            if (reg.e === 'PA' || reg.s === 'PA') {
                                const alObj = dadosAlunos.find(a => a.cpf === cpf);
                                if(alObj) eventosMistos.push({ dataStr: d, type: 'ATRASO', icon: 'ph-clock', cor: 'warning', desc: 'Atrasado (PA)', nome: alObj.aluno, cpf: alObj.cpf });
                            }
                        });
                    }
                });
            });

            eventosMistos.sort((a,b) => new Date(b.dataStr) - new Date(a.dataStr));

            if (eventosMistos.length === 0) {
                painelEventos.innerHTML = '<div class="text-center text-secondary py-4 w-100"><i class="ph ph-check-circle fs-2 text-success"></i><br>Nenhum evento registrado.</div>';
            } else {
                painelEventos.innerHTML = '';
                eventosMistos.slice(0, 6).forEach(ev => {
                    painelEventos.innerHTML += `
                    <div class="d-flex align-items-center justify-content-between p-2 border-bottom hover-bg-light" style="cursor:pointer;" onclick="window.abrirFichaAluno('${ev.cpf}')">
                        <div class="d-flex align-items-center gap-2">
                            <div class="p-2 text-bg-${ev.cor} bg-opacity-10 text-${ev.cor} rounded"><i class="ph ${ev.icon}"></i></div>
                            <div style="line-height: 1.2;">
                                <div class="fw-semibold text-dark small">${ev.nome.split(' ')[0]} ${ev.nome.split(' ')[1] || ''}</div>
                                <div class="text-secondary" style="font-size:0.7rem;">${ev.desc}</div>
                            </div>
                        </div>
                        <div class="text-muted" style="font-size:0.7rem;">${ev.dataStr.substring(0,10)}</div>
                    </div>
                    `;
                });
            }
        }
        
        renderizarSaidaIndevida(dadosFreq, datasDisponiveis, alunosFiltrados);
    }

    function renderizarSaidaIndevida(dadosFreq, datasDisponiveis, alunosFiltrados) {
        const tbodySaidaIndevida = document.getElementById('dash-saida-indevida-tbody');
        if (!tbodySaidaIndevida) return;
        
        let listSaidaIndevida = [];
        datasDisponiveis.forEach(d => {
            const dataBr = d.split('-').reverse().join('/');
            Object.keys(dadosFreq[d]).forEach(tk => {
                Object.keys(dadosFreq[d][tk]).forEach(cpf => {
                    const rec = dadosFreq[d][tk][cpf];
                    if ((rec.e === 'P' && rec.s === 'F') || (rec.e === 'F' && rec.s === 'P')) {
                        const alunoObj = alunosFiltrados.find(a => a.cpf === cpf); 
                        if (alunoObj) {
                            let exist = listSaidaIndevida.find(i => i.cpf === cpf);
                            if (!exist) listSaidaIndevida.push({ cpf: cpf, aluno: alunoObj.aluno, turma: alunoObj.turma, datas: [dataBr] });
                            else if (!exist.datas.includes(dataBr)) exist.datas.push(dataBr);
                        }
                    }
                });
            });
        });

        if (listSaidaIndevida.length === 0) {
            tbodySaidaIndevida.innerHTML = '<tr><td colspan="4" class="text-center" style="color: #059669; font-weight: 500; padding:1.5rem;"><i class="ph ph-check-circle fs-3 align-middle me-2"></i> Nenhuma evasão intradiária detectada no turno.</td></tr>';
        } else {
            tbodySaidaIndevida.innerHTML = '';
            listSaidaIndevida.forEach(v => {
                tbodySaidaIndevida.innerHTML += `
                    <tr>
                        <td><strong class="text-dark">${v.aluno}</strong></td>
                        <td><span class="badge bg-light border border-secondary text-secondary">${v.turma}</span></td>
                        <td class="text-center text-warning fw-bold text-dark">${v.datas.join(', ')}</td>
                        <td class="text-end"><button class="btn btn-sm btn-outline-warning text-dark rounded-pill" onclick="window.abrirFichaAluno('${v.cpf}')">Dossiê</button></td>
                    </tr>
                `;
            });
        }
    }

    const domFiltroTurno = document.getElementById('dash-filtro-turno');
    if (domFiltroTurno) domFiltroTurno.addEventListener('change', atualizarDashboard);
    
    const domFiltroBim = document.getElementById('dash-filtro-bimestre');
    if (domFiltroBim) domFiltroBim.addEventListener('change', atualizarDashboard);

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
    
    // ==========================================
    // 13. SISTEMA OFFLINE E SINCRONIZAÇÃO
    // ==========================================
    const networkStatus = document.getElementById('network-status');
    const syncQueueKey = 'rvs_sync_queue';

    window.showToast = function(message) {
        let toastEl = document.getElementById('global-toast');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'global-toast';
            toastEl.style.position = 'fixed';
            toastEl.style.bottom = '20px';
            toastEl.style.right = '20px';
            toastEl.style.backgroundColor = '#10B981'; // Green
            toastEl.style.color = '#FFFFFF';
            toastEl.style.padding = '12px 24px';
            toastEl.style.borderRadius = '8px';
            toastEl.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
            toastEl.style.fontWeight = '500';
            toastEl.style.zIndex = '9999';
            toastEl.style.transition = 'opacity 0.3s, transform 0.3s';
            document.body.appendChild(toastEl);
        }
        
        toastEl.innerHTML = `<i class="ph ph-check-circle" style="vertical-align: middle; margin-right: 8px; font-size: 1.25rem;"></i> ${message}`;
        toastEl.style.opacity = '1';
        toastEl.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateY(20px)';
        }, 4000);
    }

    function updateNetworkStatus() {
        if (!networkStatus) return;
        if (navigator.onLine) {
            networkStatus.className = 'badge bg-success d-flex align-items-center gap-1';
            networkStatus.innerHTML = '<i class="ph ph-wifi-high"></i> Online';
            syncPendingData();
        } else {
            networkStatus.className = 'badge bg-warning text-dark d-flex align-items-center gap-1';
            networkStatus.innerHTML = '<i class="ph ph-wifi-x"></i> Modo Offline - Dados Salvos no Celular';
        }
    }

    // Configuração do Back-end Google Sheets
    const URL_DO_WEBAPP = 'https://script.google.com/macros/s/AKfycbw-NhyyFWLcgg2OA9UWcLPZgYwc-U6dcdqa223zqaDb7txNWDM2PrRCvemAuxVNFPRImQ/exec';

    window.syncPendingData = async function() {
        let queue = JSON.parse(localStorage.getItem(syncQueueKey)) || [];
        if (queue.length === 0) return;

        const userStr = localStorage.getItem('rvs_usuarioAtivo');
        const user = userStr ? JSON.parse(userStr) : {email: 'offline_unknown'};
        const usuarioLogado = user.email;

        console.log(`[Sync] Processando fila de ${queue.length} ações...`);
        let origLength = queue.length;
        
        while (queue.length > 0) {
            let item = queue[0];
            const payload = {
                tipo: item.tipo,
                autor: usuarioLogado,
                dados: item.tipo === "FREQUENCIA" ? [item.dados] : item.dados
            };

            try {
                const response = await fetch(URL_DO_WEBAPP, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    console.log(`[AppSheet Sync] Sucesso: Pacote do tipo ${item.tipo} integrado!`);
                    queue.shift(); // Concluído
                    localStorage.setItem(syncQueueKey, JSON.stringify(queue));
                } else {
                    console.error(`[AppSheet Sync] Falha P/ ${item.tipo}:`, result.message || result.info, 'Dados Enviados:', payload);
                    break;
                }
            } catch (error) {
                console.error(`[AppSheet Sync] Conexão Perdida com Google Apps Script:`, error);
                break;
            }
        }
        
        if (origLength > 0 && queue.length < origLength) {
            window.showToast(`Dados sincronizados com sucesso para nuvem! Restam ${queue.length} pacotes.`);
        }
    }

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    // Dispara a verificação logo ao abrir para atualizar o badge apropriadamente
    updateNetworkStatus();

    // ==========================================
    // 14. MEU PERFIL (DOSSIÊ DO LOGADO)
    // ==========================================
    const btnMeuPerfil = document.getElementById('meu-perfil-btn');
    if (btnMeuPerfil) {
        btnMeuPerfil.addEventListener('click', (e) => {
            e.preventDefault();
            const userStr = localStorage.getItem('rvs_usuarioAtivo');
            if (userStr) {
                const user = JSON.parse(userStr);
                document.getElementById('perfil-nome').textContent = user.nome;
                document.getElementById('perfil-cargo').textContent = user.role === 'manager' ? 'Gestor Administrativo' : 'Professor Titular';
                document.getElementById('perfil-email').textContent = user.email;
                document.getElementById('perfil-nivel').textContent = user.role.toUpperCase();
                document.getElementById('perfil-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&size=150&background=1E3A8A&color=fff`;
            }
            document.getElementById('meu-perfil-modal').classList.remove('hidden');
        });
    }

    // ==========================================
    // 15. CÂMERA NATIVA (INPUT FILE) & COMPRESSÃO
    // ==========================================
    const cameraInput = document.getElementById('camera-native-input');
    const cameraCanvas = document.getElementById('camera-canvas');
    let cameraTarget = null; // 'novo-aluno' ou 'perfil'

    window.abrirCamera = function(target, preferredMode = 'environment') {
        cameraTarget = target;
        if(cameraInput) {
            if (preferredMode === 'user') {
                cameraInput.setAttribute('capture', 'user');
            } else {
                cameraInput.setAttribute('capture', 'environment');
            }
            cameraInput.click(); // Dispara o popup nativo de câmera do mobile
        }
    }

    if(cameraInput) {
        cameraInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const MAX_WIDTH = 800;
                    let scale = 1;
                    if (img.width > MAX_WIDTH) {
                        scale = MAX_WIDTH / img.width;
                    }

                    const newWidth = Math.floor(img.width * scale);
                    const newHeight = Math.floor(img.height * scale);

                    if(cameraCanvas) {
                        cameraCanvas.width = newWidth;
                        cameraCanvas.height = newHeight;
                        
                        const ctx = cameraCanvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, newWidth, newHeight);

                        // Compressão agressiva em JPEG 80%
                        const base64Img = cameraCanvas.toDataURL('image/jpeg', 0.8);
                        
                        processarFotoCapturada(cameraTarget, base64Img);
                    }
                    // Reset input
                    cameraInput.value = '';
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function processarFotoCapturada(target, base64Img) {
        if (target === 'novo-aluno') {
            const previewImg = document.getElementById('novo-aluno-foto-preview');
            if(previewImg) previewImg.src = base64Img;
            const container = document.getElementById('novo-aluno-preview-container');
            if(container) container.style.display = 'block';
            window.tempNovoAlunoBase64 = base64Img; // Cache local auxiliar pra hora de salvar Novo Aluno
        } else if (target === 'perfil') {
            const avatarImg = document.getElementById('perfil-avatar');
            if(avatarImg) avatarImg.src = base64Img;

            // Salva na persistência local do Manager/Professor
            const userStr = localStorage.getItem('rvs_usuarioAtivo');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.foto = base64Img;
                localStorage.setItem('rvs_usuarioAtivo', JSON.stringify(user));
                
                // Dispara sincronização para a nuvem
                let syncQueue = JSON.parse(localStorage.getItem('rvs_sync_queue')) || [];
                syncQueue.push({
                    tipo: "ATUALIZAR_PERFIL",
                    dados: user, // user contém 'foto' e 'email'
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('rvs_sync_queue', JSON.stringify(syncQueue));
                
                if (navigator.onLine && typeof window.syncPendingData === 'function') window.syncPendingData();
            }
        }
    }

    // Acionar câmera do Perfil
    document.getElementById('btn-camera-perfil')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.abrirCamera('perfil', 'user'); // User = Selfie
    });

    // Acionar câmera do Novo Aluno
    document.getElementById('btn-camera-novo-aluno')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.abrirCamera('novo-aluno', 'environment'); // Environment = Câmera Traseira
    });

});
