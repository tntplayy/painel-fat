// Configuração do Supabase
const SUPABASE_URL = 'https://moeatmaurbmblfpqwcok.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZWF0bWF1cmJtYmxmcHF3Y29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDE2OTUsImV4cCI6MjEwNjUxNzY5NX0.iOR5Ejz561Kw7AvIpddza30FL2eTIPlebvVIgsI0q0g';

// Garante que o Supabase foi carregado corretamente
if (window.supabase) {
    console.log("Supabase SDK carregado com sucesso!");
} else {
    console.error("ERRO: Supabase SDK não foi carregado!");
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- LÓGICA DE LOGIN ---
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Botão de login acionado. A processar...");

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const errorMsg = document.getElementById('error-msg');

            if (!emailInput || !passwordInput) {
                alert("Erro: Campos de input não encontrados!");
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (errorMsg) {
                errorMsg.classList.add('hidden');
                errorMsg.textContent = '';
            }

            try {
                const { data, error } = await supabase.auth.signInWithPassword({ 
                    email: email, 
                    password: password 
                });

                if (error) {
                    console.error("Erro retornado pelo Supabase:", error);
                    alert("Erro ao entrar: " + error.message);
                    if (errorMsg) {
                        errorMsg.textContent = 'Erro: ' + error.message;
                        errorMsg.classList.remove('hidden');
                    }
                } else {
                    console.log("Login bem sucedido! Dados da sessão:", data);
                    alert("Login bem sucedido! A abrir o painel...");
                    window.location.href = './dashboard.html';
                }
            } catch (err) {
                console.error("Erro crítico na requisição:", err);
                alert("Erro inesperado: " + err.message);
            }
        });
    } else {
        console.warn("Aviso: Elemento 'login-form' não encontrado nesta página.");
    }
});

// --- VERIFICAÇÃO DE SESSÃO (DASHBOARD) ---
async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session) {
        console.warn("Nenhuma sessão ativa encontrada. A redirecionar para o login...");
        window.location.href = './index.html';
    }
}

if (window.location.pathname.includes('dashboard.html')) {
    checkAuth();
    carregarTotais();
}

// --- NAVEGAÇÃO ENTRE ABAS ---
function switchTab(tab) {
    const tabDash = document.getElementById('tab-dashboard');
    const tabAndre = document.getElementById('tab-andre');
    const tabEduarda = document.getElementById('tab-eduarda');

    if (!tabDash) return;

    tabDash.classList.add('hidden');
    tabAndre.classList.add('hidden');
    tabEduarda.classList.add('hidden');

    document.getElementById('btn-dashboard').className = "w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-700 text-gray-300 transition";
    document.getElementById('btn-andre').className = "w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-700 text-gray-300 transition";
    document.getElementById('btn-eduarda').className = "w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-700 text-gray-300 transition";

    if (tab === 'dashboard') {
        tabDash.classList.remove('hidden');
        document.getElementById('btn-dashboard').className = "w-full text-left px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium transition";
        carregarTotais();
    } else if (tab === 'andre') {
        tabAndre.classList.remove('hidden');
        document.getElementById('btn-andre').className = "w-full text-left px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium transition";
    } else if (tab === 'eduarda') {
        tabEduarda.classList.remove('hidden');
        document.getElementById('btn-eduarda').className = "w-full text-left px-4 py-2.5 rounded-lg bg-purple-600 text-white font-medium transition";
    }
}

// --- LOGOUT ---
async function logout() {
    await supabase.auth.signOut();
    window.location.href = './index.html';
}

// --- SALVAR DADOS (ANDRÉ) ---
const formAndre = document.getElementById('form-andre');
if (formAndre) {
    formAndre.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mes = document.getElementById('mes-andre').value;
        const bruto = parseFloat(document.getElementById('bruto-andre').value);
        const lucro = parseFloat(document.getElementById('lucro-andre').value);

        const { error } = await supabase.from('faturamento').insert([{ conta: 'andre', mes, bruto, lucro }]);
        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            alert('Faturamento de André salvo com sucesso!');
            formAndre.reset();
            carregarTotais();
        }
    });
}

// --- SALVAR DADOS (EDUARDA) ---
const formEduarda = document.getElementById('form-eduarda');
if (formEduarda) {
    formEduarda.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mes = document.getElementById('mes-eduarda').value;
        const bruto = parseFloat(document.getElementById('bruto-eduarda').value);
        const lucro = parseFloat(document.getElementById('lucro-eduarda').value);

        const { error } = await supabase.from('faturamento').insert([{ conta: 'eduarda', mes, bruto, lucro }]);
        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            alert('Faturamento de Eduarda salvo com sucesso!');
            formEduarda.reset();
            carregarTotais();
        }
    });
}

// --- CARREGAR TOTAIS NA DASHBOARD ---
async function carregarTotais() {
    const { data, error } = await supabase.from('faturamento').select('*');
    if (error) {
        console.error("Erro ao carregar dados:", error);
        return;
    }

    let totalAndre = 0;
    let totalEduarda = 0;

    data.forEach(item => {
        if (item.conta === 'andre') totalAndre += Number(item.bruto);
        if (item.conta === 'eduarda') totalEduarda += Number(item.bruto);
    });

    const totalGeral = totalAndre + totalEduarda;

    const elAndre = document.getElementById('total-andre');
    const elEduarda = document.getElementById('total-eduarda');
    const elGeral = document.getElementById('total-geral');

    if (elAndre) elAndre.textContent = `R$ ${totalAndre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elEduarda) elEduarda.textContent = `R$ ${totalEduarda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (elGeral) elGeral.textContent = `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}
