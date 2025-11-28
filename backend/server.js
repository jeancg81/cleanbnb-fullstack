require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- CONFIGURAÇÕES ---
app.use(cors()); 
app.use(express.json());

// --- 1. CONEXÃO COM O BANCO DE DADOS ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Conectado! Servidor Pronto.'))
    .catch((err) => console.error('❌ Erro ao conectar no MongoDB:', err));

// --- 2. O MODELO (Como os dados são salvos) ---
const AgendamentoSchema = new mongoose.Schema({
    nomeCliente: String,
    endereco: String,
    whatsapp: String,
    data: String,
    tipoLimpeza: String,
    valor: Number,
    criadoEm: { type: Date, default: Date.now }
});

const Agendamento = mongoose.model('Agendamento', AgendamentoSchema);

// --- 3. AS ROTAS ---

app.get('/', (req, res) => {
    res.send('🚀 Servidor CleanBnB está rodando!');
});

app.get('/agendamentos', async (req, res) => {
    try {
        const lista = await Agendamento.find();
        res.json(lista);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar dados" });
    }
});

// [POST] Criar novo (AQUI ESTÁ A LINHA DE DEBUG)
app.post('/agendamentos', async (req, res) => {
    try {
        const novoAgendamento = new Agendamento(req.body);
        await novoAgendamento.save();
        res.status(201).json(novoAgendamento);
    } catch (erro) {
        console.error("ERRO FATAL AO TENTAR SALVAR NO BANCO:", erro); // <--- DEBUG TRACER
        res.status(500).json({ erro: "Erro ao salvar" });
    }
});

// [DELETE] Apagar um agendamento
app.delete('/agendamentos/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletado = await Agendamento.findByIdAndDelete(id);
        
        if (!deletado) {
            return res.status(404).json({ erro: "Agendamento não encontrado" });
        }
        res.status(200).json({ message: "Deletado com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro interno ao deletar" });
    }
});

// --- 4. INICIAR O SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 Servidor rodando na porta ${PORT}`);
});