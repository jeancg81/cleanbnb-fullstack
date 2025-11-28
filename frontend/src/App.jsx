import { useState, useEffect } from 'react';

// --- ENDEREÇO DA API PÚBLICA ---
const API_URL = 'https://cleanbnb-fullstack.onrender.com/agendamentos'; 

function App() {
  const [formData, setFormData] = useState({
    nomeCliente: '',
    endereco: '',
    whatsapp: '',
    data: '',
    tipoLimpeza: 'Padrão'
  });
  const [agendamentos, setAgendamentos] = useState([]);

  const handleChange = (e) => {
    // Note: Esta função não tem problemas. O erro está no que ela dispara (o re-render).
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FUNÇÃO CORRIGIDA: AGORA É DEFENSIVA! ---
  const carregarAgendamentos = async () => {
    try {
      const response = await fetch(API_URL);
      
      // Se o servidor retornar 500, response.ok é false
      if (!response.ok) {
        console.error("API Error Status:", response.status);
        setAgendamentos([]); // Garante que o estado seja um array vazio para não quebrar.
        return;
      }
      
      const dados = await response.json();

      // VERIFICA SE É ARRAY ANTES DE SETAR O ESTADO
      if (Array.isArray(dados)) { 
        setAgendamentos(dados);
      } else {
        console.error("API retornou objeto quebrado:", dados);
        setAgendamentos([]); // Previne o crash
      }
    } catch (error) {
      console.error("Erro fatal na busca (Rede):", error);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  // --- Funções de Delete e Create (Omitidas, mas iguais) ---

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja cancelar essa limpeza?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { 
          method: 'DELETE',
        });

        if (response.ok) {
          alert("🗑️ Item excluído com sucesso!");
          carregarAgendamentos();
        } else {
          alert("❌ O Servidor recusou. Verifique o console para 404/500.");
        }
      } catch (error) {
        alert("❌ Erro de Conexão: O Backend parece desligado.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let valorLimpeza = 150;
      if (formData.tipoLimpeza === "Pesada") valorLimpeza = 250;
      if (formData.tipoLimpeza === "Expressa") valorLimpeza = 100;

      const response = await fetch(API_URL, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, valor: valorLimpeza }), 
      });

      if (response.ok) {
        alert("✅ Agendamento realizado!");
        setFormData({ nomeCliente: '', endereco: '', whatsapp: '', data: '', tipoLimpeza: 'Padrão' });
        carregarAgendamentos();
      } else {
        alert("❌ Erro ao agendar.");
      }
    } catch (erro) {
      alert("❌ Erro de conexão!");
    }
  };


  // --- CÁLCULOS DO DASHBOARD ---
  // O Reduce agora SÓ roda se agendamentos for Array (graças ao nosso novo check!)
  const totalFaturamento = agendamentos.reduce((acc, item) => acc + item.valor, 0);
  const totalLimpezas = agendamentos.length;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
      {/* FORMULÁRIO */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 mb-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2 tracking-tight">CleanBnB</h1>
          <p className="text-lg font-medium text-gray-700">Seu imóvel impecável, seus hóspedes felizes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
            <input type="text" name="nomeCliente" value={formData.nomeCliente} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Jean Carlos" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço</label>
            <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Rua das Flores, 123" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp</label>
              <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="(11) 99999..." required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Data</label>
              <input type="date" name="data" value={formData.data} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Limpeza</label>
            <select name="tipoLimpeza" value={formData.tipoLimpeza} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="Padrão">Limpeza Padrão (R$ 150)</option>
              <option value="Pesada">Limpeza Pesada (R$ 250)</option>
              <option value="Expressa">Limpeza Expressa (R$ 100)</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition shadow-md">
            Confirmar Agendamento
          </button>
        </form>
      </div>

      {/* ÁREA DE DADOS */}
      <div className="w-full max-w-md pb-20">
        
        {/* Painel Verde (Dashboard) */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-lg transform hover:scale-105 transition duration-300">
          <h2 className="text-lg font-semibold opacity-90 mb-4">💰 Painel Financeiro</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Faturamento Total</p>
              <p className="text-3xl font-bold">R$ {totalFaturamento},00</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Limpezas</p>
              <p className="text-3xl font-bold">{totalLimpezas}</p>
            </div>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">📅 Próximas Limpezas</h2>
        
        {agendamentos.length === 0 && (
          <p className="text-gray-500 text-center">Nenhum agendamento encontrado.</p>
        )}

        <div className="space-y-4">
          {agendamentos.map((item) => (
            <div key={item._id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 flex justify-between items-center group">
              <div>
                <h3 className="font-bold text-gray-800">{item.nomeCliente}</h3>
                <p className="text-sm text-gray-600">{item.endereco}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{item.tipoLimpeza}</span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{item.data}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-green-600">R$ {item.valor}</span>
                <button 
                  onClick={() => handleDelete(item._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 hover:bg-red-50 p-1 rounded transition"
                >
                  🗑️ Excluir
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;