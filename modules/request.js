const querystring = require('querystring')

module.exports = request

function request ({ method = 'GET', url, headers = { }, qs, body, timeout = 5000 }) {
	return new Promise(send)

	function send (resolve, reject) {
		if (!url) {
			reject(new Error("Imagine request without URL, can you? I can't."))
			return
		}

		const instance = new XMLHttpRequest()

		instance.onreadystatechange = e => {
			if (instance.readyState != 4) {
				return
			}
			unsubscribe()
			resolve({ statusCode: instance.status, body: getResponseBody(instance) })
		}

		instance.ontimeout = e => {
			unsubscribe()
			reject(new Error(`${method} ${url} timed out after ${timeout} ms`))
		}

		Object.entries(headers).map(pair => instance.setRequestHeader(...pair))
		instance.timeout = timeout

		instance.open(method, qs ? `${url}?${querystring.stringify(qs)}` : url)

		if (body) {
			instance.setRequestHeader('content-type', 'application/json')
			instance.send(JSON.stringify(body))
		} else {
			instance.send()
		}

		function unsubscribe () {
			instance.onreadystatechange = null
			instance.ontimeout = null
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