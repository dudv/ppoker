import request from 'superagent'
import io from 'socket.io-client'

const HOST = `${window.location.protocol}//${window.location.hostname}:3001`
const buildUrl = (u, b) => HOST + u + (typeof b !== 'undefined' && b !== null ? '/' + b : '')

const makeRequest = (url, session=null, data={}, method='get') => {
	return request[method](buildUrl(url, session), data)
		.then(data => {
			return data.body
	 	})
}

const socket = io(HOST)
const emitMessage = (channel, data) => {
	return new Promise((resolve, reject) => {
		socket.emit(channel, data)
		socket.on(channel, (data) => {
			resolve(data)
		})
	})
}

const onMessage = (channel, cb) => socket.on(channel, cb)

export { makeRequest, emitMessage, onMessage }