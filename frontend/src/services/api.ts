import axios from 'axios'

const api = axios.create({
    baseURL: '/api'
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
        if (error.response) {
            console.error('API Error:', error.response.data.message)
        } else {
            console.error('Network Error')
        }

        return Promise.reject(error)
    }
)

export default api
