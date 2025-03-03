import { DIFY_INFO } from "./vars"

export class XRequest {

  constructor(options: {
    baseURL: string,
		apiKey: string,
  }) {
    this.options = options
  }

  options: {
    baseURL: string,
		apiKey: string,
  }

  async baseRequest(url: string, options: RequestInit) {
    const result = await fetch(`${this.options.baseURL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.options.apiKey}`,
      }
    })
    if (result.headers.get('X-Version')) {
      const newDifyVersion = result.headers.get('X-Version')
      // 比较本地缓存的版本和当前版本
      if (newDifyVersion && newDifyVersion !== DIFY_INFO.version) {
        DIFY_INFO.version = newDifyVersion
      }
    }
    return result
  }

  async jsonRequest(url: string, options: RequestInit) {
    const result = await this.baseRequest(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      }
    })
    return result.json()
  }

  async get(url: string, params?: Record<string, unknown>, headers: Record<string, string> = {}) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    const result = await this.jsonRequest(`${url}${queryString}`, {
      method: 'GET',
      headers
    })
    return result
  }

  async post(url: string, params?: Record<string, unknown>, headers: Record<string, string> = {}) {
    const result = await this.jsonRequest(url, {
      method: 'POST',
      body: JSON.stringify(params),
      headers
    })
    return result
  }

	async delete(url: string, params?: Record<string, unknown>, headers: Record<string, string> = {}) {
		const result = await this.jsonRequest(url, {
			method: 'DELETE',
			body: JSON.stringify(params),
			headers
		})
		return result
	}
}

export default XRequest
