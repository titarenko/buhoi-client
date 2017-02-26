const urlParse = require('url-parse')
const queryString = require('querystring')

module.exports = {
	reducer,
	navigateTo,
	start,
}

function reducer (state = null, action) {
	if (action.type != 'BUHOI_NAVIGATE_TO') {
		return state
	}

	const { route, url, silent } = action
	if (!silent) {
		window.history.pushState(route, document.title, url)
	}

	return route
}

function navigateTo (route) {
	if (!route) {
		throw new Error('Missing parameter: route.')
	}

	return {
		type: 'BUHOI_NAVIGATE_TO',
		route: typeof route == 'string' ? parseRoute(route) : route,
		url: typeof route == 'string' ? route : stringifyRoute(route),
	}
}

function start (dispatch) {
	window.onpopstate = ev => dispatch({ ...navigateTo(ev.state), silent: true })
	const currentUrl = `${location.pathname || ''}${location.search || ''}`
	dispatch(navigateTo(currentUrl))
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