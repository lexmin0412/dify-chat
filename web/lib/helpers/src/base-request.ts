export class BaseRequest {
	constructor(options: { baseURL: string; headers?: Record<string, string> }) {
		this.options = options
	}

	options: {
		baseURL: string
		headers?: Record<string, string>
	}

	baseRequest = async (url: string, options: RequestInit) => {
		const result = await fetch(`${this.options.baseURL}${url}`, {
			...options,
			headers: {
				...this.options.headers,
				...options.headers,
			},
		})
		return result
	}

	jsonRequest = async (url: string, options: RequestInit) => {
		const result = await this.baseRequest(url, {
			...options,
			headers: {
				...options.headers,
				'Content-Type': 'application/json',
			},
		})
		return result.json()
	}

	get = async (
		url: string,
		params: Record<string, string> = {},
		headers: Record<string, string> = {},
	) => {
		// 过滤掉值为 undefined 的参数
		const filteredParams = Object.fromEntries(
			Object.entries(params).filter(([_, value]) => value !== undefined),
		)
		const queryString =
			filteredParams && Object.keys(filteredParams).length > 0
				? `?${new URLSearchParams(filteredParams).toString()}`
				: ''
		const result = await this.jsonRequest(`${url}${queryString}`, {
			method: 'GET',
			headers,
		})
		return result
	}

	post = async (
		url: string,
		params: Record<string, unknown> = {},
		headers: Record<string, string> = {},
	) => {
		// 过滤掉值为 undefined 的参数
		const filteredParams = Object.fromEntries(
			Object.entries(params).filter(([_, value]) => value !== undefined),
		)
		const result = await this.jsonRequest(url, {
			method: 'POST',
			body: JSON.stringify(filteredParams),
			headers,
		})
		return result
	}

	put = async (
		url: string,
		params: Record<string, unknown> = {},
		headers: Record<string, string> = {},
	) => {
		// 过滤掉值为 undefined 的参数
		const filteredParams = Object.fromEntries(
			Object.entries(params).filter(([_, value]) => value !== undefined),
		)
		const result = await this.jsonRequest(url, {
			method: 'PUT',
			body: JSON.stringify(filteredParams),
			headers,
		})
		return result
	}

	delete = async (
		url: string,
		params: Record<string, unknown> = {},
		headers: Record<string, string> = {},
	) => {
		// 过滤掉值为 undefined 的参数
		const filteredParams = Object.fromEntries(
			Object.entries(params).filter(([_, value]) => value !== undefined),
		)
		const result = await this.baseRequest(url, {
			method: 'DELETE',
			body: JSON.stringify(filteredParams),
			headers: {
				...headers,
				'Content-Type': 'application/json',
			},
		})
		return result
	}
}
