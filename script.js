// Sistema de Academia - Frontend
const API_BASE = CONFIG.API_BASE_URL;
let token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN) || '';

function setToken(t) {
  token = t;
  localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, t);
}

function getHeaders() {
  return { 
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

// ==== LOGIN ====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (res.ok) {
      setToken(data.token);

      // ✅ Corrigido: se CONFIG não existir, vai usar uma chave padrão
      const userKey = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS) 
        ? CONFIG.STORAGE_KEYS.USER 
        : 'user';

      // Salva o usuário logado no localStorage
      localStorage.setItem(userKey, JSON.stringify(data.usuario));

      // Mostra o nome e troca de tela
      document.getElementById('loginScreen').classList.remove('active');
      document.getElementById('dashboardScreen').classList.add('active');
      document.getElementById('userName').textContent = data.usuario.nome;

      carregarTabelas();
    } else {
      alert(data.error || 'Erro ao fazer login');
    }
  } catch (error) {
    alert('Erro de conexão com o servidor');
    console.error('Erro:', error);
  }
});


// CADASTRO
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const senha = document.getElementById('registerPassword').value;

  try {
    const res = await fetch(`${API_BASE}/auth/registrar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Usuário cadastrado com sucesso! Faça login.');
      showLoginForm();
      document.getElementById('registerForm').reset();
    } else {
      alert(data.error || 'Erro ao cadastrar usuário');
    }
  } catch (error) {
    alert('Erro de conexão com o servidor');
    console.error('Erro:', error);
  }
});


// ==== LOGOUT ====
function logout() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
  localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
  token = '';
  document.getElementById('dashboardScreen').classList.remove('active');
  document.getElementById('loginScreen').classList.add('active');
}

// ==== CRUD ALUNOS ====
async function carregarAlunos() {
  try {
    const res = await fetch(`${API_BASE}/alunos`, { headers: getHeaders() });
    
    if (!res.ok) {
      throw new Error('Erro ao carregar alunos');
    }
    
    const alunos = await res.json();
    const tbody = document.querySelector('#alunosTable tbody');
    
    tbody.innerHTML = alunos.map(a => `
      <tr>
        <td>${a.nome}</td>
        <td>${a.email}</td>
        <td>${a.telefone}</td>
        <td>${a.plano}</td>
        <td>
          <button onclick="editarAluno(${a.id})" class="btn-edit"><i class="fas fa-edit"></i></button>
          <button onclick="excluirAluno(${a.id})" class="btn-delete"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar alunos:', error);
    alert('Erro ao carregar lista de alunos');
  }
}

document.getElementById('alunoForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const editId = form.dataset.editId;
  const isEditing = !!editId;

  const body = {
    nome: document.getElementById('alunoNome').value,
    email: document.getElementById('alunoEmail').value,
    telefone: document.getElementById('alunoTelefone').value,
    plano: document.getElementById('alunoPlano').value
  };

  try {
    const url = isEditing ? `${API_BASE}/alunos/${editId}` : `${API_BASE}/alunos`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: getHeaders(),
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert(isEditing ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!');
      closeModal('alunoModal');
      document.getElementById('alunoForm').reset();
      delete form.dataset.editId;
      document.getElementById('alunoModalTitle').textContent = 'Adicionar Aluno';
      carregarAlunos();
    } else {
      const error = await res.json();
      alert(error.error || (isEditing ? 'Erro ao atualizar aluno' : 'Erro ao cadastrar aluno'));
    }
  } catch (error) {
    alert('Erro de conexão com o servidor');
    console.error('Erro:', error);
  }
});

async function excluirAluno(id) {
  if (confirm('Tem certeza que deseja excluir este aluno?')) {
    try {
      const res = await fetch(`${API_BASE}/alunos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        alert('Aluno excluído com sucesso!');
        carregarAlunos();
      } else {
        alert('Erro ao excluir aluno');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor');
      console.error('Erro:', error);
    }
  }
}

async function editarAluno(id) {
  try {
    // Buscar dados do aluno
    const res = await fetch(`${API_BASE}/alunos/${id}`, { headers: getHeaders() });
    
    if (!res.ok) {
      throw new Error('Erro ao buscar dados do aluno');
    }
    
    const aluno = await res.json();
    
    // Preencher o formulário com os dados atuais
    document.getElementById('alunoNome').value = aluno.nome;
    document.getElementById('alunoEmail').value = aluno.email;
    document.getElementById('alunoTelefone').value = aluno.telefone;
    document.getElementById('alunoPlano').value = aluno.plano;
    
    // Alterar o título do modal e adicionar ID para edição
    document.getElementById('alunoModalTitle').textContent = 'Editar Aluno';
    document.getElementById('alunoForm').dataset.editId = id;
    
    // Abrir o modal
    openModal('alunoModal', true);
  } catch (error) {
    console.error('Erro ao carregar dados do aluno:', error);
    alert('Erro ao carregar dados do aluno para edição');
  }
}

// ==== CRUD PROFESSORES ====
async function carregarProfessores() {
  try {
    const res = await fetch(`${API_BASE}/professores`, { headers: getHeaders() });
    
    if (!res.ok) {
      throw new Error('Erro ao carregar professores');
    }
    
    const professores = await res.json();
    const tbody = document.querySelector('#professoresTable tbody');
    
    tbody.innerHTML = professores.map(p => `
      <tr>
        <td>${p.nome}</td>
        <td>${p.email}</td>
        <td>${p.especialidade}</td>
        <td>${p.telefone}</td>
        <td>
          <button onclick="editarProfessor(${p.id})" class="btn-edit"><i class="fas fa-edit"></i></button>
          <button onclick="excluirProfessor(${p.id})" class="btn-delete"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar professores:', error);
    alert('Erro ao carregar lista de professores');
  }
}

document.getElementById('professorForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const editId = form.dataset.editId;
  const isEditing = !!editId;

  const body = {
    nome: document.getElementById('professorNome').value,
    email: document.getElementById('professorEmail').value,
    especialidade: document.getElementById('professorEspecialidade').value,
    telefone: document.getElementById('professorTelefone').value
  };

  try {
    const url = isEditing ? `${API_BASE}/professores/${editId}` : `${API_BASE}/professores`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: getHeaders(),
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert(isEditing ? 'Professor atualizado com sucesso!' : 'Professor cadastrado com sucesso!');
      closeModal('professorModal');
      document.getElementById('professorForm').reset();
      delete form.dataset.editId;
      document.getElementById('professorModalTitle').textContent = 'Adicionar Professor';
      carregarProfessores();
    } else {
      const error = await res.json();
      alert(error.error || (isEditing ? 'Erro ao atualizar professor' : 'Erro ao cadastrar professor'));
    }
  } catch (error) {
    alert('Erro de conexão com o servidor');
    console.error('Erro:', error);
  }
});

async function excluirProfessor(id) {
  if (confirm('Tem certeza que deseja excluir este professor?')) {
    try {
      const res = await fetch(`${API_BASE}/professores/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        alert('Professor excluído com sucesso!');
        carregarProfessores();
      } else {
        alert('Erro ao excluir professor');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor');
      console.error('Erro:', error);
    }
  }
}

async function editarProfessor(id) {
  try {
    // Buscar dados do professor
    const res = await fetch(`${API_BASE}/professores/${id}`, { headers: getHeaders() });
    
    if (!res.ok) {
      throw new Error('Erro ao buscar dados do professor');
    }
    
    const professor = await res.json();
    
    // Preencher o formulário com os dados atuais
    document.getElementById('professorNome').value = professor.nome;
    document.getElementById('professorEmail').value = professor.email;
    document.getElementById('professorEspecialidade').value = professor.especialidade;
    document.getElementById('professorTelefone').value = professor.telefone;
    
    // Alterar o título do modal e adicionar ID para edição
    document.getElementById('professorModalTitle').textContent = 'Editar Professor';
    document.getElementById('professorForm').dataset.editId = id;
    
    // Abrir o modal
    openModal('professorModal', true);
  } catch (error) {
    console.error('Erro ao carregar dados do professor:', error);
    alert('Erro ao carregar dados do professor para edição');
  }
}

// ==== CRUD PERSONAIS ====
async function carregarPersonais() {
  try {
    const res = await fetch(`${API_BASE}/personais`, { headers: getHeaders() });
    
    if (!res.ok) {
      throw new Error('Erro ao carregar personal trainers');
    }
    
    const personais = await res.json();
    const tbody = document.querySelector('#personalTable tbody');
    
    tbody.innerHTML = personais.map(p => `
      <tr>
        <td>${p.nome}</td>
        <td>${p.email}</td>
        <td>${p.especialidade}</td>
        <td>R$ ${parseFloat(p.valorHora).toFixed(2)}</td>
        <td>
          <button onclick="editarPersonal(${p.id})" class="btn-edit"><i class="fas fa-edit"></i></button>
          <button onclick="excluirPersonal(${p.id})" class="btn-delete"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar personal trainers:', error);
    alert('Erro ao carregar lista de personal trainers');
  }
}

document.getElementById('personalForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const editId = form.dataset.editId;
  const isEditing = !!editId;

  const body = {
    nome: document.getElementById('personalNome').value,
    email: document.getElementById('personalEmail').value,
    especialidade: document.getElementById('personalEspecialidade').value,
    valorHora: parseFloat(document.getElementById('personalValorHora').value)
  };

  try {
    const url = isEditing ? `${API_BASE}/personais/${editId}` : `${API_BASE}/personais`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: getHeaders(),
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert(isEditing ? 'Personal trainer atualizado com sucesso!' : 'Personal trainer cadastrado com sucesso!');
      closeModal('personalModal');
      document.getElementById('personalForm').reset();
      delete form.dataset.editId;
      document.getElementById('personalModalTitle').textContent = 'Adicionar Personal Trainer';
      carregarPersonais();
    } else {
      const error = await res.json();
      alert(error.error || (isEditing ? 'Erro ao atualizar personal trainer' : 'Erro ao cadastrar personal trainer'));
    }
  } catch (error) {
    alert('Erro de conexão com o servidor');
    console.error('Erro:', error);
  }
});

async function excluirPersonal(id) {
  if (confirm('Tem certeza que deseja excluir este personal trainer?')) {
    try {
      const res = await fetch(`${API_BASE}/personais/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        alert('Personal trainer excluído com sucesso!');
        carregarPersonais();
      } else {
        alert('Erro ao excluir personal trainer');
      }
    } catch (error) {
      alert('Erro de conexão com o servidor');
      console.error('Erro:', error);
    }
  }
}

async function editarPersonal(id) {
  try {
    // Buscar dados do personal trainer
    const res = await fetch(`${API_BASE}/personais/${id}`, { headers: getHeaders() });
    
    if (!res.ok) {
      throw new Error('Erro ao buscar dados do personal trainer');
    }
    
    const personal = await res.json();
    
    // Preencher o formulário com os dados atuais
    document.getElementById('personalNome').value = personal.nome;
    document.getElementById('personalEmail').value = personal.email;
    document.getElementById('personalEspecialidade').value = personal.especialidade;
    document.getElementById('personalValorHora').value = personal.valorHora;
    
    // Alterar o título do modal e adicionar ID para edição
    document.getElementById('personalModalTitle').textContent = 'Editar Personal Trainer';
    document.getElementById('personalForm').dataset.editId = id;
    
    // Abrir o modal
    openModal('personalModal', true);
  } catch (error) {
    console.error('Erro ao carregar dados do personal trainer:', error);
    alert('Erro ao carregar dados do personal trainer para edição');
  }
}

// ==== CARREGAR TODAS AS TABELAS ====
async function carregarTabelas() {
  await Promise.all([
    carregarAlunos(),
    carregarProfessores(),
    carregarPersonais()
  ]);
}

// ==== CONTROLE DE MODAIS ====
function openModal(id, isEditing = false) {
  // Só limpar dados quando não estiver editando
  if (!isEditing) {
    if (id === 'alunoModal') {
      const form = document.getElementById('alunoForm');
      delete form.dataset.editId;
      document.getElementById('alunoModalTitle').textContent = 'Adicionar Aluno';
      form.reset();
    } else if (id === 'professorModal') {
      const form = document.getElementById('professorForm');
      delete form.dataset.editId;
      document.getElementById('professorModalTitle').textContent = 'Adicionar Professor';
      form.reset();
    } else if (id === 'personalModal') {
      const form = document.getElementById('personalForm');
      delete form.dataset.editId;
      document.getElementById('personalModalTitle').textContent = 'Adicionar Personal Trainer';
      form.reset();
    }
  }
  
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// ==== TROCA DE TELAS LOGIN / CADASTRO ====
function showLoginForm() {
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
  
  // Atualizar tabs
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.tab-btn').classList.add('active');
}

function showRegisterForm() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
  
  // Atualizar tabs
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

// ==== TROCA DE SEÇÕES NO DASHBOARD ====
function showSection(section, element) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelector(`#${section}Section`).classList.add('active');
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  }
}

// ==== VERIFICAR SE USUÁRIO ESTÁ LOGADO ====
function verificarLogin() {
  const savedToken = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
  if (savedToken) {
    token = savedToken;
    // Verificar se o token ainda é válido
    fetch(`${API_BASE}${CONFIG.ENDPOINTS.ALUNOS}`, { headers: getHeaders() })
      .then(res => {
        if (res.ok) {
          document.getElementById('loginScreen').classList.remove('active');
          document.getElementById('dashboardScreen').classList.add('active');
          
          // Recuperar dados do usuário se salvos
          const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
          if (savedUser) {
            const user = JSON.parse(savedUser);
            document.getElementById('userName').textContent = user.nome;
          }
          
          carregarTabelas();
        } else {
          localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
          localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        }
      })
      .catch(() => {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
      });
  }
}

// Verificar login ao carregar a página
document.addEventListener('DOMContentLoaded', verificarLogin);
