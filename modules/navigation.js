const urlParse = require('url-parse')
const queryString = require('querystring')

let defaultRoute

module.exports = {
	reducer,

	navigateTo,
	setQueryParams,

	setDefaultRoute,
	start,
}

function reducer (state = null, action) {
	if (action.type != 'NAVIGATE_TO') {
		return state
	}

	const { location = defaultRoute, silent } = action
	const route = typeof location == 'string' ? parseRoute(location) : location
	const url = typeof location == 'string' ? location : stringifyRoute(location)

	if (!silent) {
		window.history.pushState(route, document.title, url)
	}

	return { ...route, query: route.query || { }, url, previous: state }
}

function navigateTo (location) {
	return { type: 'NAVIGATE_TO', location }
}

function setQueryParams (keyValues) {
	return (dispatch, getState) => {
		const route = getState().route
		return dispatch(navigateTo({ ...route, query: { ...route.query, ...keyValues } }))
	}
}

function setDefaultRoute (route) {
	defaultRoute = route
}

function start (dispatch) {
	window.onpopstate = ev => dispatch({ ...navigateTo(ev.state), silent: true })
	const currentUrl = `${location.pathname || ''}${location.search || ''}`
	dispatch(navigateTo(currentUrl))
}

function parseRoute (url) {
	const parsed = urlParse(url, true)
	const tokens = parsed.pathname.slice(1).split('/')
	return {
		entity: tokens[0],
		action: tokens[1],
		id: tokens[2],
		query: parsed.query,
	}
}

function stringifyRoute ({ entity, id, action, query }) {
	return '/' + [
		[entity, action, id].filter(Boolean).join('/'),
		query ? queryString.stringify(omitUndefined(query)) : null,
	].filter(Boolean).join('?')
}

function omitUndefined (obj) {
	return Object.entries(obj).reduce(
		(newObj, pair) => pair[1] !== undefined ? { ...newObj, [pair[0]] : pair[1] } : newObj,
		{ }
	)
}