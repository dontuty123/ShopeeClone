import axios, { type AxiosInstance } from 'axios'
import { AuthResponse } from 'src/types/auth.type'
import { clearLS, getAccessTokenFromLS, saveAccessTokenToLS, saveProfileToLS } from './auth'

class Http {
  instance: AxiosInstance
  private accessToken: string
  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.instance = axios.create({
      baseURL: 'https://api-ecom.duthanhduoc.com/',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.authorization = this.accessToken
          return config
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    this.instance.interceptors.response.use((response) => {
      const url = response.config.url
      if (url === 'login' || url === 'register') {
        this.accessToken = (response.data as AuthResponse).data.access_token
        saveAccessTokenToLS(this.accessToken)
        saveProfileToLS((response.data as AuthResponse).data.user)
      } else if (url === 'logout') {
        this.accessToken = ''
        clearLS()
      }
      return response
    })
  }
}

const http = new Http().instance

export default http
