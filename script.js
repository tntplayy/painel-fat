// Substitua pelas suas credenciais do projeto Supabase
const SUPABASE_URL = 'SUA_SUPABASE_URL_AQUI';
const SUPABASE_ANON_KEY = 'SUA_SUPABASE_ANON_KEY_AQUI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- LÓGICA DE LOGIN ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-msg');

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            errorMsg.textContent = 'E-mail ou senha incorretos.';
            errorMsg.classList.remove('hidden');
        } else {
            window.location.href = 'dashboard.html';
        }
    });
}

// --- VERIFICAÇÃO DE SESSÃO NAS PÁGINAS PROTEGIDAS ---
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}
if (window.location.pathname.includes('dashboard.html')) {
    checkAuth();
    carregarTotais();
}

// --- NAVEGAÇÃO ENTRE ABAS ---
function switchTab(tab) {
    document.getElementById('tab-dashboard').classList.add('hidden');
    document.getElementById('tab-andre').classList.add('hidden');
    document.getElementById('tab-eduarda').classList.add('hidden');

    document.getElementById('btn-dashboard').className = "w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-700 text-gray-300 transition";
    document.getElementById('btn-andre').className = "w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-700 text-gray-300 transition";
    document.getElementById('btn-eduarda').className = "w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-700 text-gray-300 transition";

    if (tab === 'dashboard') {
        document.getElementById('tab-dashboard').classList.remove('hidden');
        document.getElementById('btn-dashboard').className = "w-full text-left px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium transition";
        carregarTotais();
    } else if (tab === 'andre') {
        document.getElementById('tab-andre').classList.remove('hidden');
        document.getElementById('btn-andre').className = "w-full text-left px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium transition";
    } else if (tab === 'eduarda') {
        document.getElementById('tab-eduarda').classList.remove('hidden');
        document.getElementById('btn-eduarda').className = "w-full text-left px-4 py-2.5 rounded-lg bg-purple-600 text-white font-medium transition";
    }
}

// --- LOGOUT ---
async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
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
        }
    });
}

// --- CARREGAR TOTAIS NA DASHBOARD ---
async function carregarTotais() {
    const { data, error } = await supabase.from('faturamento').select('*');
    if (error) return;

    let totalAndre = 0;
    let totalEduarda = 0;

    data.forEach(item => {
        if (item.conta === 'andre') totalAndre += item.bruto;
        if (item.conta === 'eduarda') totalEduarda += item.bruto;
    });

    const totalGeral = totalAndre + totalEduarda;

    document.getElementById('total-andre').textContent = `R$ ${totalAndre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('total-eduarda').textContent = `R$ ${totalEduarda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('total-geral').textContent = `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}
