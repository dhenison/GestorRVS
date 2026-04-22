from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
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
        
        # AQUI VOCÊ CHAMARÁ A FUNÇÃO DO WHATSAPP POSTERIORMENTE
        # disparar_alertas_whatsapp(dados)
        
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
