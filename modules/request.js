const querystring = require('querystring')

module.exports = request

function request ({ method = 'GET', url, headers = { }, qs, body, timeout = 5000 }) {
	return new Promise(send)

	function send (resolve, reject) {
		if (!url) {
			reject(new Error("Imagine request without URL, can you? I can't."))
			return
		}

		let timeoutId = setTimeout(() => {
			timeoutId = null
			unsubscribe()
			reject(new Error(`${method} ${url} timed out after ${timeout} ms`))
		}, timeout)

		const instance = new XMLHttpRequest()

		instance.onreadystatechange = ev_ => {
			if (instance.readyState != 4 || timeoutId == null) {
				return
			}
			clearTimeout(timeoutId)
			unsubscribe()
			if (instance.status == 0) {
				reject(new Error('No response received from server, probably network error.'))
			} else {
				resolve({ statusCode: instance.status, body: getResponseBody(instance) })
			}
		}

		instance.open(method, qs ? `${url}?${querystring.stringify(qs)}` : url)
		Object.entries(headers).map(pair => instance.setRequestHeader(...pair))

		if (body) {
			instance.setRequestHeader('content-type', 'application/json')
			instance.send(JSON.stringify(body))
		} else {
			instance.send()
		}


		function unsubscribe () {
			instance.onreadystatechange = null
		}
	}
}

function getResponseBody (instance) {
	if (instance.responseText == null) {
		return instance.responseText
	}
	const contentType = instance.getResponseHeader('content-type')
	return contentType && contentType.includes('json')
		? JSON.parse(instance.responseText)
		: instance.responseText
}