const { createStore, combineReducers, applyMiddleware } = require('redux')

const reduxThunk = require('redux-thunk').default
const reduxDevtools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()

const navigation = require('./navigation')

module.exports = { create }

function create ({ appReducer, additionalMiddleware }) {
	let componentReducer = (state = null, action) => state

	const reducer = combineReducers({
		app: appReducer,
		route: navigation.reducer,
		page: pageReducer,
		version: versionReducer,
	})
	const middlewareList = [reduxThunk, reduxDevtools].concat(additionalMiddleware).filter(Boolean)
	const middleware = applyMiddleware.apply(null, middlewareList)
	const store = createStore(reducer, undefined, middleware)

	store.setComponentReducer = reducer => componentReducer = reducer

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