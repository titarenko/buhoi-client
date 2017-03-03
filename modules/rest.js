const util = require('util')
const request = require('./request')

module.exports = { read, write, setAuthenticationFailureHandler, setPersistentHeader }

function setAuthenticationFailureHandler (handler) {
	if (!handler) {
		throw new Error('Handler is required.')
	}
	this.authenticationFailureHandler = handler
}

function setPersistentHeader (header) {
	if (!header) {
		throw new Error('Header object is required.')
	}
	this.persistentHeader = header
}

function read (operation, url, qs) {
	return rest.call(this, operation, { url, qs })
}

function write (operation, url, body) {
	return rest.call(this, operation, { method: getMethod(), url, body })
	function getMethod () {
		if (url.includes('.')) { // RPC convention
			return 'POST'
		}
		return body && body.id ? 'PUT' : 'POST'
	}
}

function rest(operation, params) {
	if (!operation) {
		throw new Error('No operation.')
	}

	const start = `${operation}_STARTED`
	const success = `${operation}_SUCCEEDED`
	const ban = `${operation}_FORBIDDEN`
	const invalidity = `${operation}_INVALID`
	const redirect = 'NAVIGATE_TO'
	const failure = `${operation}_FAILED`

	const finalParams = this.persistentHeader
		? { ...params, headers: { ...params.headers, ...this.persistentHeader } }
		: params

	return dispatch => {
		dispatch({
			type: start,
			request: request(finalParams)
				.then(r => {
					if (r.statusCode == 400) {
						dispatch({ type: invalidity, errors: r.body })
						return
					}
					if (r.statusCode == 401 && this.authenticationFailureHandler) {
						this.authenticationFailureHandler(dispatch)
						return
					}
					if (r.statusCode == 403) {
						dispatch({ type: ban })
						return
					}
					if (r.statusCode >= 400) {
						throw new RestRequestError(r.statusCode, r.body)
					}
					dispatch( { type: success, result: r.body })
				})
				.catch(e => dispatch({ type: failure, reason: e.message }))
		})
	}
}

function RestRequestError (statusCode, body) {
	this.statusCode = statusCode
	this.body = body
	Error.call(this, `Request failed with status code ${statusCode} and body "${body}".`)
	Error.captureStackTrace(this, RestRequestError)
}

util.inherits(RestRequestError, Error)