import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api'

const api = axios.create({
    baseURL,
})

// Request interceptor to add the auth token header to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor (MANDATORY per guide)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear all auth data
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('store_name')

            // Redirect to login page
            window.location.href = '/'
        }

        if (error.response) {
            console.error('API Error:', error.response.data.message)
        } else {
            console.error('Network Error')
        }

        return Promise.reject(error)
    }
)

export default api
