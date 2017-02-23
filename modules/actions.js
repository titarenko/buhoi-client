const urlParse = require('url-parse')
const queryString = require('querystring')

module.exports = { hotReload, navigateTo }

function hotReload () {
	return { type: 'HOT_RELOAD' }
}

function navigateTo (route, silent) {
	if (!route) {
		throw new Error('Missing parameter: route.')
	}

	return {
		type: 'NAVIGATE_TO',
		route: typeof route == 'string' ? parseRoute(route) : route,
		url: typeof route == 'string' ? route : stringifyRoute(route),
		silent
	}
}

function parseRoute (url) {
	const parsed = urlParse(url, true)
	const tokens = parsed.pathname.slice(1).split('/')

	const collection = tokens[0]
	const id = tokens[1] == '-' ? undefined : tokens[1]
	const action = tokens[2] || (id ? 'edit' : 'list')

	return {
		collection,
		id,
		action,
		query: parsed.query,
	}
}

function stringifyRoute ({ collection, id, action, query }) {
	return '/' + [
		[collection, id || action ? '-' : null, action].filter(Boolean).join('/'),
		query ? queryString.stringify(query) : null,
	].filter(Boolean).join('?')
}