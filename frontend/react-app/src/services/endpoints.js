const BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const endpoints = {
    contatos: {
        list: `${BASE_URL}/contatos/`,
        list_day: `${BASE_URL}/contatos-dia/`,
    }
}
