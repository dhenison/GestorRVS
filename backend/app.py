from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import requests
import os

app = Flask(__name__)
# O CORS é essencial pois o front-end PWA vai mandar as requisições de origem diferente para a API Flask no Render
CORS(app)

# Configuração do Banco de Dados PostgreSQL do Render
# ATENÇÃO: A URI do SQLAlchemy precisa ser uma string de conexão de banco (ex: postgresql://user:pass@host/db).
# Se usar a URL https://gestorrvs.onrender.com isso gerará um erro. 
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///local_test.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# [MODELO] Tabula Alunos (Necessária para rastrear nome e telefone pelo CPF da placa do PWA)
class Aluno(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cpf = db.Column(db.String(20), unique=True, nullable=False)
    nome_aluno = db.Column(db.String(150), nullable=False)
    whatsapp_responsavel = db.Column(db.String(20), nullable=False)

# Modelo da Tabela de Frequência adaptada para o padrão do Gestor RVS PWA (Micro-movimentos)
class Frequencia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cpf_aluno = db.Column(db.String(20), nullable=False)
    tipo_movimento = db.Column(db.String(10), nullable=False) # 'E' (Entrada) ou 'S' (Saída)
    valor_registro = db.Column(db.String(5), nullable=False) # 'P', 'F', 'FJ', 'PA'
    turma = db.Column(db.String(20), nullable=True) # Qual turma do aluno
    data_base = db.Column(db.String(15), nullable=True) # Dia letivo (Ex: 2026-04-22)
    data_hora = db.Column(db.DateTime, nullable=False) # Timestamp exato do clique
    status_envio = db.Column(db.String(20), default='sincronizado')

def disparar_alertas_whatsapp(registros):
    # Configurações da sua API (Z-API ou Evolution API)
    ZAPI_INSTANCE = "SUA_INSTANCIA"
    ZAPI_TOKEN = "SEU_TOKEN"
    API_URL = f"https://api.z-api.io/instancia/{ZAPI_INSTANCE}/token/{ZAPI_TOKEN}/send-text"

    for item in registros:
        cpf_enviado = item.get('cpf', '')
        # Busca os dados do aluno pelo CPF que veio do AppSheet/PWA
        aluno = Aluno.query.filter_by(cpf=cpf_enviado).first()
        
        # Ignora avisos em registros brancos/faltas e processa apenas se encontrou um aluno na DB
        if not aluno or item.get('valorRegistro') not in ['P', 'PA']:
             continue
             
        telefone = aluno.whatsapp_responsavel
        nome_aluno = aluno.nome_aluno
        
        # Define a mensagem conforme o tipo (E de Entrada ou S de Saída)
        status = "entrou na" if item.get('tipoMovimento') == 'E' else "saiu da"
        horario = datetime.fromisoformat(item['timestamp'].replace('Z', '+00:00')).strftime('%H:%M')
        
        mensagem = f"🏫 *ESCOLA RVS INFORMA:*\n\nO(A) aluno(a) *{nome_aluno}* {status} escola às {horario}."

        # Faz o envio real para Z-API
        payload = {"phone": telefone, "message": mensagem}
        try:
            requests.post(API_URL, json=payload, timeout=5)
            print(f"Alerta PWA enviado para Z-API: {nome_aluno}")
        except Exception as e:
            print(f"Falha de rede ao enviar WhatsApp para {nome_aluno}: {e}")

# ROTA PARA RECEBER SINCRONIZAÇÃO (Onde o PWA vai "descarregar" os dados do IndexedDB)
@app.route('/sincronizar', methods=['POST'])
def sincronizar():
    payload = request.get_json() # PWA envia { "tipo": "...", "autor": "...", "dados": [...] }
    
    if not payload or 'dados' not in payload:
        return jsonify({"status": "error", "mensagem": "Payload inválido"}), 400
        
    dados = payload['dados']
    tipo_pacote = payload.get('tipo', '')
    
    try:
        # Se for um disparo online imediato (vem como dicionário). Se for sincronização de atrasados IndexedDB (vem como lista)
        if isinstance(dados, dict):
            dados = [dados]

        for item in dados:
            nova_presenca = Frequencia(
                cpf_aluno=item.get('cpf', ''),
                tipo_movimento=item.get('tipoMovimento', ''),
                valor_registro=item.get('valorRegistro', ''),
                turma=item.get('turma', ''),
                data_base=item.get('dataBase', ''),
                # Converte o timestamp ISO que o frontend gravou no IndexedDB
                data_hora=datetime.fromisoformat(item['timestamp'].replace('Z', '+00:00'))
            )
            db.session.add(nova_presenca)
        
        db.session.commit()
        
        # Disparo da régua de comunicação WhatsApp
        disparar_alertas_whatsapp(dados)
        
        # O JS do Frontend (PWA) confere se o valor é "success" para purgar o IndexedDB
        return jsonify({"status": "success", "mensagem": f"{len(dados)} registro(s) sincronizados com o Render"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "mensagem": str(e)}), 500

# Criação das tabelas localmente caso não existam
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    # No servidor Render, a porta normalmente é fornecida por váriável de ambiente
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
