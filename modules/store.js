const { createStore, combineReducers, applyMiddleware } = require('redux')

const reduxThunk = require('redux-thunk').default
const reduxDevtools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()

const navigation = require('./navigation')

module.exports = { create }

function create ({ appReducer }) {
	let componentReducer = (state = null, action) => state

	const reducer = combineReducers({
		app: appReducer,
		route: navigation.reducer,
		page: pageReducer,
	})
	const middleware = applyMiddleware.apply(null, [reduxThunk, reduxDevtools].filter(Boolean))
	const store = createStore(reducer, undefined, middleware)

	store.setComponentReducer = reducer => componentReducer = reducer

	return store

	function pageReducer (state, action) {
		return action.type == 'BUHOI_NAVIGATE_TO' ? { } : componentReducer(state, action)
	}
}