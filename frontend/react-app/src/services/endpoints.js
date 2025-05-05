/* ABAIXO UM EXEMPLO DE COMO DEVE SER */
const BASE_URL = 'https://api.exemplo.com';

export const endpoints = {
    users: {
        list: `${BASE_URL}/users`,
        detail: (id) => `${BASE_URL}/users/${id}`,
        create: `${BASE_URL}/users`,
    },
    products: {
        list: `${BASE_URL}/products`,
        detail: (id) => `${BASE_URL}/products/${id}`,
    }
};
