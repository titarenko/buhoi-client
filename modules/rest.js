const util = require('util')
const request = require('./request')

module.exports = { read, write, setLoginRedirect }

function setLoginRedirect (location) {
	if (!location) {
		throw new Error('Cannot redirect nowhere.')
	}
	this.loginLocation = location
}

function read (url, qs, operation) {
	return rest.call(this, operation, { url, qs}, r => {
		const resultKey = response.body && response.body.length != null ? 'items' : 'item'
		return { type: success, [resultKey]: response.body }
	})
}

function write (url, body, operation) {
	return rest.call(this, operation, { method: getMethod(), url, body })
	function getMethod () {
		if (url.includes('.')) { // RPC convention
			return 'POST'
		}
		return body && body.id ? 'PUT' : 'POST'
	}
}

function rest(operation, params, successAction) {
	if (!operation) {
		throw new Error('No operation.')
	}

	const start = `${operation}_STARTED`
	const success = `${operation}_SUCCEEDED`
	const ban = `${operation}_FORBIDDEN`
	const redirect = 'NAVIGATE_TO'
	const failure = `${operation}_FAILED`

	return dispatch => {
		dispatch({ type: start })
		request(params)
			.then(r => {
				if (r.statusCode == 401 && this.loginLocation) {
					dispatch({ type: redirect, location: this.loginLocation })
					return
				}
				if (r.statusCode == 403) {
					dispatch({ type: ban })
					return
				}
				if (r.statusCode >= 400) {
					throw new RestRequestError(r.statusCode, r.body)
				}
				const successAttrs = successAction ? successAction(r) : { }
				dispatch( { type: success, ...successAttrs })
			})
			.catch(e => dispatch({ type: failure, reason: e.message }))
	}
}

function RestRequestError (statusCode, body) {
	this.statusCode = statusCode
	this.body = body
	Error.call(this, `Request failed with status code ${statusCode} and body "${body}".`)
	Error.captureStackTrace(this, RestRequestError)
}

util.inherits(RestRequestError, Error)