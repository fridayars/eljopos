import axios from 'axios'

const api = axios.create({
    baseURL: '/api'
})

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
