const get = require('lodash.get')

module.exports = create

function create ({ appReducers = [], pageReducers = [] }) {
	const appReducer = createFirstMatchReducer(appReducers.concat([navigationReducer]))
	const pageReducer = createFirstMatchReducer(pageReducers)

	return reducer

	function reducer (state, action) {
		const newState = appReducer(state, action)
		return newState === state
			? { ...newState, page: pageReducer(get(state, 'page', { }), action) }
			: newState
	}
}

function createFirstMatchReducer (reducers) {
	return firstMatchReducer

	function firstMatchReducer (state, action) {
		let newState = null
		reducers.some(it => newState = it(state, action))
		return newState || state
	}
}

function navigationReducer (state, action) {
	if (action.type != 'BUHOI_NAVIGATE_TO') {
		return
	}

	const { route, url, silent } = action
	if (!silent) {
		window.history.pushState(route, document.title, url)
	}

	return { ...state, route: action.route, page: { } }
}