const request = require('./request')

module.exports = { actions: { read, write, remove }, errorInterceptor }

function read (operation, url, qs) {
	return rest.call(this, operation, { url, qs }, qs)
}

function write (operation, url, body) {
	if (url.includes('.')) { // RPC convention
		return rest.call(this, operation, { method: 'POST', url, body }, body)
	} else {
		return rest.call(this, operation, {
			method: body.id ? 'PUT' : 'POST',
			url: body.id ? `${url}/${body.id}` : url,
			body,
		}, body)
	}
}

function remove (operation, url) {
	return rest.call(this, operation, { url, method: 'DELETE' })
}

function rest (operation, params, payload) {
	if (!operation) {
		throw new Error('No operation.')
	}
	return dispatch => {
		dispatch({
			type: `${operation}_STARTED`,
			payload,
			request: request(params)
				.then(r => {
					if (r.statusCode >= 400) {
						const error = new Error(String(r.statusCode))
						error.statusCode = r.statusCode
						error.body = r.body
						throw error
					}
					dispatch({
						type: `${operation}_SUCCEEDED`,
						payload,
						result: r.body,
					})
				})
				.catch(e => dispatch({
					type: `${operation}_FAILED`,
					payload,
					error: e,
				})),
		})
	}
}

function errorInterceptor (handler) {
	return store => next => action => {
		const result = next(action)
		if (action.type.endsWith('_FAILED')) {
			handler(action, store.dispatch, store.getState)
		}
		return result
	}
}