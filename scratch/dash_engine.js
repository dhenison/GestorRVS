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
    
    // Obter bases de dados
    const dadosAlunos = JSON.parse(localStorage.getItem('rvs_alunos_cadastrados')) || [];
    const dadosFreq = JSON.parse(localStorage.getItem('rvs_frequencia')) || {};
    const dadosOcorrencias = JSON.parse(localStorage.getItem('rvs_ocorrencias')) || {};

    // Filtrar Alunos pelo Turno
    const alunosFiltrados = turnoSelecionado === 'ALL' 
        ? dadosAlunos 
        : dadosAlunos.filter(a => getTurnoFromTurma(a.turma) === turnoSelecionado);

    const cpfsNoTurno = alunosFiltrados.map(a => a.cpf);
    const turmasNoTurno = [...new Set(alunosFiltrados.map(a => a.turma))];

    // ==========================================
    // 1. STATUS DE LANÇAMENTO (Hoje)
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
    // 2. HOJE VS. MÉDIA HISTÓRICA DE FALTAS
    // ==========================================
    const datasDisponiveis = Object.keys(dadosFreq).sort();
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
        if (totalDiasHistorico === 0 || !dadosFreq[hojeStr]) {
            domMedia.textContent = '--';
            domMediaTxt.textContent = "Aguardando dados estruturados...";
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
                domMedia.textContent = "Igual a Média";
                domMedia.classList.remove('text-danger', 'text-success');
                domMediaIco.className = "ph ph-minus fs-3 text-secondary";
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
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [2, 4] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // ==========================================
    // 4. ALERTA CRÍTICO: Risco de Evasão (25% ou 3 Consecutivas)
    // ==========================================
    const tbodyEvasao = document.getElementById('dash-evasao-tbody');
    if (tbodyEvasao) {
        let vulneraveis = [];
        const limiteFaltas = 12; // Base de 50 dias letivos bimestral (25% = 12)

        alunosFiltrados.forEach(al => {
            let historicoAluno = [];
            
            // Reconstruir linha do tempo do aluno
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
            
            // Contagem consecutivas recentes (de trás pra frente)
            let consecutivasRecentes = 0;
            for (let i = historicoAluno.length - 1; i >= 0; i--) {
                if (historicoAluno[i] === 'F') consecutivasRecentes++;
                else if (historicoAluno[i] !== 'FJ') break; // FJ não zera consecutiva nociva, mas não é F? Vamos quebrar se ele foi P.
                // Se foi P ou PA, quebra a sequencia de faltas lógicas.
            }

            if (totaisGlobaisF >= limiteFaltas || consecutivasRecentes >= 3) {
                let mot = totaisGlobaisF >= limiteFaltas ? 'Estourou 25%' : 'Falta Consecutiva (>3)';
                vulneraveis.push({
                    aluno: al.aluno, cpf: al.cpf, turma: al.turma, totalF: totaisGlobaisF, motivo: mot
                });
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
                    <td><strong class="text-dark">${v.aluno}</strong></td>
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
                    eventosMistos.push({
                        dataStr: oc.dataHora || oc.data, type: 'OCOR', icon: 'ph-warning', cor: 'danger', desc: oc.tipo, nome: alObj.aluno, cpf: alObj.cpf
                    });
                });
            }
        });

        // Coletar Últimos Atrasos
        datasDisponiveis.slice(-3).forEach(d => {
            Object.keys(dadosFreq[d]).forEach(tk => {
                if (turnoSelecionado === 'ALL' || getTurnoFromTurma(tk) === turnoSelecionado) {
                    Object.keys(dadosFreq[d][tk]).forEach(cpf => {
                        const reg = dadosFreq[d][tk][cpf];
                        if (reg.e === 'PA' || reg.s === 'PA') {
                            const alObj = dadosAlunos.find(a => a.cpf === cpf);
                            if(alObj) {
                                eventosMistos.push({
                                    dataStr: d, type: 'ATRASO', icon: 'ph-clock', cor: 'warning', desc: 'Chegou Atrasado (PA)', nome: alObj.aluno, cpf: alObj.cpf
                                });
                            }
                        }
                    });
                }
            });
        });

        // Ordenar misto descrescentemente.
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

    // Preservar Lógica de Saída Indevida (Do código antigo) e Retornos
    // (Por brevidade, podemos acionar uma renderização auxiliar se necessário, mas vou plugar a indevida ali embaixo.)
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
                    const alunoObj = alunosFiltrados.find(a => a.cpf === cpf); // Verifica tb se ta no filtro
                    if (alunoObj) {
                        let exist = listSaidaIndevida.find(i => i.cpf === cpf);
                        if (!exist) {
                            listSaidaIndevida.push({ cpf: cpf, aluno: alunoObj.aluno, turma: alunoObj.turma, datas: [dataBr] });
                        } else {
                            if (!exist.datas.includes(dataBr)) exist.datas.push(dataBr);
                        }
                    }
                }
            });
        });
    });

    if (listSaidaIndevida.length === 0) {
        tbodySaidaIndevida.innerHTML = '<tr><td colspan="4" class="text-center" style="color: #059669; font-weight: 500; padding:1.5rem;"><i class="ph ph-check-circle fs-3 align-middle me-2"></i> Nenhuma evasão intradiária detectada.</td></tr>';
    } else {
        tbodySaidaIndevida.innerHTML = '';
        listSaidaIndevida.forEach(v => {
            tbodySaidaIndevida.innerHTML += `
                <tr>
                    <td><strong class="text-dark">${v.aluno}</strong></td>
                    <td><span class="badge border border-secondary text-secondary">${v.turma}</span></td>
                    <td class="text-center text-warning fw-bold text-dark">${v.datas.join(', ')}</td>
                    <td class="text-end"><button class="btn btn-sm btn-outline-warning text-dark rounded-pill" onclick="window.abrirFichaAluno('${v.cpf}')">Dossiê</button></td>
                </tr>
            `;
        });
    }
}
