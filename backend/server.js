require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- CONFIGURAÇÕES ---
app.use(cors()); // Permite que o Frontend (site) converse com o Backend
app.use(express.json()); // Permite ler dados enviados em formato JSON

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

// --- 3. AS ROTAS (Os comandos da API) ---

// Rota Raiz (Para teste)
app.get('/', (req, res) => {
    res.send('🚀 Servidor CleanBnB está rodando!');
});

// [GET] Listar todos os agendamentos
app.get('/agendamentos', async (req, res) => {
    try {
        const lista = await Agendamento.find();
        res.json(lista);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar agendamentos" });
    }
});

// [POST] Criar novo agendamento
app.post('/agendamentos', async (req, res) => {
    try {
        const novoAgendamento = new Agendamento(req.body);
        await novoAgendamento.save();
        res.status(201).json(novoAgendamento);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar agendamento" });
    }
});

// [DELETE] Apagar um agendamento pelo ID
app.delete('/agendamentos/:id', async (req, res) => {
    const id = req.params.id;
    console.log("📢 Recebido pedido para deletar ID:", id); // Aviso no terminal

    try {
        const resultado = await Agendamento.findByIdAndDelete(id);

        if (!resultado) {
            console.log("❌ ID não encontrado no banco.");
            return res.status(404).json({ erro: "Agendamento não encontrado." });
        }

        console.log("✅ Deletado com sucesso!");
        res.status(200).json({ message: "Agendamento deletado!" });
    } catch (erro) {
        console.error("❌ Erro ao tentar deletar:", erro);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
});

// --- 4. INICIAR O SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 Servidor rodando na porta ${PORT}`);
});