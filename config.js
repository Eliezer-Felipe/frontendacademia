// Configurações da aplicação
const CONFIG = {
    API_BASE_URL: 'backendacademia-production-6ae4.up.railway.app/api',
    
    // Endpoints da API
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/registrar'
        },
        ALUNOS: '/alunos',
        PROFESSORES: '/professores',
        PERSONAIS: '/personais'
    },
    
    // Configurações de localStorage
    STORAGE_KEYS: {
        TOKEN: 'fitgym_token',
        USER: 'fitgym_user'
    }
};

// Exportar configurações para uso global
window.CONFIG = CONFIG