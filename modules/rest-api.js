const util = require('util')
const request = require('./request')

module.exports = { actions: { read, write, remove } }

function read (operation, url, qs) {
	return rest.call(this, operation, { url, qs })
}

function write (operation, url, body) {
	if (url.includes('.')) { // RPC convention
		return rest.call(this, operation, { method: 'POST', url, body })
	} else {
		return rest.call(this, operation, {
			method: body.id ? 'PUT' : 'POST',
			url: body.id ? `${url}/${body.id}` : url,
			body,
		})
	}
}

function remove (operation, url, id) {
	return rest.call(this, operation, { url: `${url}/${id}`, method: 'DELETE' })
}

function rest (operation, params) {
	if (!operation) {
		throw new Error('No operation.')
	}

	const start = `${operation}_STARTED`
	const success = `${operation}_SUCCEEDED`
	const failure = `${operation}_FAILED`

	return dispatch => {
		dispatch({
			type: start,
			request: request(params)
				.then(r => {
					if (r.statusCode >= 400) {
						throw new RestRequestError(r.statusCode, r.body)
					}
					dispatch({ type: success, result: r.body })
				})
				.catch(e => dispatch({ type: failure, error: e })),
		})
	}
}

function RestRequestError (statusCode, body) {
	this.statusCode = statusCode
	this.body = body
	this.message = String(body || statusCode || 'REST request failed')
	Error.call(this, this.message)
	Error.captureStackTrace(this, RestRequestError)
}

util.inherits(RestRequestError, Error)