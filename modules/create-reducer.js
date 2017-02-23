module.exports = create

function create ({ reducers = [] }) {
	reducers.unshift(hotReloadReducer)
	reducers.unshift(navigationReducer)

	return function (state, action) {
		let newState = null
		reducers.some(it => newState = it(state, action))
		return newState
	}
}

function navigationReducer (state, action) {
	if (action.type == 'NAVIGATE_TO') {
		const { route, url, silent } = action
		if (!silent) {
			window.history.pushState(route, document.title, url)
		}
		return {
			...state,
			route: action.route,
			page: { },
		}
	}
}

function hotReloadReducer (state, action) {
	if (action.type == 'HOT_RELOAD') {
		return state
	}
}