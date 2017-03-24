const { parse, stringify, isSame } = require('./route')

module.exports = {
	createRouterReducer,
	start,
	actions: { navigateTo, changeQuery },
}

function createRouterReducer ({ defaultRoute, loginRoute }) {
	defaultRoute = parse(defaultRoute)
	loginRoute = parse(loginRoute)

	return function routeReducer (state = null, action) {
		if (action.type.endsWith('_FAILED')
			&& action.error
			&& (action.error.statusCode == 401 || action.error.statusCode == 403)
			&& loginRoute
			&& !isSame(state, loginRoute, true)) {
			return loginRoute
		}

		if (action.type != 'NAVIGATE_TO') {
			return state
		}

		const { location = defaultRoute, silent } = action
		const route = typeof location == 'string' ? parse(location) : location
		const url = typeof location == 'string' ? location : stringify(location)

		if (isSame(state, route)) {
			return state
		}

		if (!silent) {
			window.history.pushState(route, document.title, url)
		}

		return { ...route, query: route.query || { }, url, previous: state }
	}
}

function start (dispatch) {
	window.onpopstate = ev => dispatch({ ...navigateTo(ev.state), silent: true })
	const currentUrl = `${location.pathname || ''}${location.search || ''}`
	dispatch(navigateTo(currentUrl))
}

function navigateTo (location) {
	return { type: 'NAVIGATE_TO', location }
}

function changeQuery (keyValues, replace) {
	return (dispatch, getState) => {
		const { route } = getState()
		return replace
			? dispatch(navigateTo({ ...route, query: keyValues }))
			: dispatch(navigateTo({ ...route, query: { ...route.query, ...keyValues } }))
	}
}