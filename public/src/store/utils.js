import request from 'superagent'

const HOST = `${window.location.protocol}//${window.location.hostname}:3001`
const buildUrl = (u, b) => HOST + u + (b ? '/' + b : '')

const makeRequest = (url, session=null, data={}, method='get') => {
	return request[method](buildUrl(url, session), data)
		.then(data => {
			return data.body
	 	})
}

export { makeRequest }