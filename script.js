// Configuração do Supabase
const SUPABASE_URL = 'https://moeatmaurbmblfpqwcok.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZWF0bWF1cmJtYmxmcHF3Y29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDE2OTUsImV4cCI6MjEwNjUxNzY5NX0.iOR5Ejz561Kw7AvIpddza30FL2eTIPlebvVIgsI0q0g';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- LÓGICA DE LOGIN ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-msg');
        
        errorMsg.classList.add('hidden');
        errorMsg.textContent = '';

        const { data, error } = await supabase.auth.signInWithPassword({ 
            email: email, 
            password: password 
        });

        if (error) {
            console.error("Erro no login:", error.message);
            errorMsg.textContent = 'Erro: E-mail ou senha incorretos.';
            errorMsg.classList.remove('hidden');
        } else {
            window.location.href = './dashboard.html';
        }
    });
}

// --- VERIFICAÇÃO DE SESSÃO ---
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && window.location.pathname.includes('dashboard.html')) {
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
