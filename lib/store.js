const { createStore, combineReducers, applyMiddleware } = require('redux')

const emptyReducer = (state = null, action_) => state

module.exports = { create }

function create ({ routeReducer, appReducer = emptyReducer, middleware }) {
	if (typeof routeReducer != 'function') {
		throw new Error('Required: routeReducer.')
	}

	let componentReducer = emptyReducer

	const reducer = combineReducers({
		route: routeReducer,
		app: appReducer,
		page: pageReducer,
		version: versionReducer,
	})
	const enhancer = middleware ? applyMiddleware(...middleware) : undefined
	const store = createStore(reducer, enhancer)

	store.setComponentReducer = reducer => componentReducer = reducer || emptyReducer

	return store

	function pageReducer (state = { }, action) {
		return action.type == 'RESET_PAGE_STATE' ? { } : componentReducer(state, action)
	}

	function versionReducer (state = { dirty: null, clean: null }, action) {
		switch (action.type) {
			case 'NAVIGATE_TO': return { dirty: new Date().getTime(), clean: state.clean }
			case 'RESET_PAGE_STATE': return { dirty: state.dirty, clean: new Date().getTime() }
			default: return state
		}
	}
}