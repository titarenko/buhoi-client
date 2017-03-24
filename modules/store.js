const { createStore, combineReducers, applyMiddleware } = require('redux')
const reduxThunk = require('redux-thunk').default
const navigation = require('./navigation')

const emptyReducer = (state = null, action_) => state

module.exports = { create }

function create ({ routeReducer = navigation.reducer, appReducer = emptyReducer, additionalMiddleware = [] }) {
	let componentReducer = emptyReducer

	const reducer = combineReducers({
		route: routeReducer,
		app: appReducer,
		page: pageReducer,
		version: versionReducer,
	})

	const middleware = [reduxThunk].concat(additionalMiddleware).filter(Boolean)
	const enhancer = applyMiddleware(...middleware)

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