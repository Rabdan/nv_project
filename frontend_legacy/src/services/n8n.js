import axios from 'axios';
import router from '../router';

// Environment variables
const MODE = import.meta.env.VITE_MODE || 'development';
const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678';

// Determine Base URLs based on Mode
// If dev, use proxy paths. If prod, use full URLs (or whatever logic is needed, but user asked for this specific logic)
const N8N_DEFAULT_PREFIX = MODE === 'development' ? '/api' : N8N_BASE_URL;

// Axios instance for n8n Webhooks
const n8nApi = axios.create({
    baseURL: N8N_DEFAULT_PREFIX,
    headers: { 'Content-Type': 'application/json' }
});

// Request Interceptor
n8nApi.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor for 401
n8nApi.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('jwt_token');
            router.push('/login');
        }
        return Promise.reject(error);
    }
);

// Helper to switch between webhook and webhook-test
const getWebhookPath = (path, useTest = false) => {
    // If useTest is true, we might need to change the baseURL or just append to a different prefix?
    // Since axios instance has a baseURL, we can override it in the request config if needed,
    // OR we just assume the path passed in is relative to the baseURL.
    // But we want to support /webhook-test/path.
    // If baseURL is /webhook, and we want /webhook-test, we need to override.
    return path;
};

// We expose a way to call with specific prefix
const callWebhook = (method, path, data = {}, useTest = false) => {
    const prefix = useTest ? '/webhook-test' : '/webhook';
    return n8nApi({
        method,
        url: path,
        baseURL: prefix, // Override baseURL for this request
        data: method === 'POST' || method === 'PUT' ? data : undefined,
        params: method === 'GET' ? data : undefined
    });
};

export default {
    async login(username, password, useTest = false) {
        // Call n8n Webhook /login
        // The workflow will then call Backend /auth/login
        const res = await callWebhook('POST', 'webhook/login', { username, password }, useTest);

        // Assuming n8n returns the token in the response
        // Note: n8n response structure might depend on the node. 
        // If "responseMode": "lastNode", it returns the JSON of the last node.
        const token = res.data.token;

        if (!token) {
            localStorage.removeItem('jwt_token');
            router.push('/login');
            throw new Error('No token returned from login webhook');
        }

        localStorage.setItem('jwt_token', token);
        return token;
    },
    async logout() {
        localStorage.removeItem('jwt_token');
        router.push('/login');
    },

    // Updated methods to support test mode (optional arg)
    async getStrategy(month, useTest = false) {
        return callWebhook('GET', `webhook-test/strategy?month=${month}`, {}, useTest);
    },
    async createStrategy(data, useTest = false) {
        return callWebhook('POST', 'webhook-test/strategy', data, useTest);
    },
    async generateContent(strategyId, useTest = false) {
        return callWebhook('POST', 'webhook-test/generate', { strategyId }, useTest);
    },
    async publishContent(postId, useTest = false) {
        return callWebhook('POST', 'webhook-test/publish', { postId }, useTest);
    },
    async getPosts(week, useTest = false) {
        return callWebhook('GET', `webhook-test/posts?week=${week}`, {}, useTest);
    },
    async updatePostStatus(postId, status, useTest = false) {
        return callWebhook('POST', 'webhook-test/post/status', { postId, status }, useTest);
    }
};
