const navigation = require('./navigation')
const loader = require('./loader')
const store = require('./store')

const { navigateTo } = navigation
const isEqual = require('lodash.isequal')
const { render } = require('inferno')

const { combineReducers } = require('redux')
const { createScopedReducer } = require('./utils')

const defaultAction = 'list'
const defaultQuery = { }

module.exports = {
	start,
	navigateTo,

	combineReducers,
	createScopedReducer,
}

function start ({ container, createContext, acceptHotUpdate, appReducer = (state = null, action) => state, defaultRoute }) {
	const root = container || document.getElementById('root')

	const loaderInstance = loader.create({ createContext, acceptHotUpdate })
	const storeInstance = store.create({ appReducer })

	storeInstance.subscribe(() => setTimeout(renderRootComponent, 0))
	loaderInstance.subscribe(() => storeInstance.dispatch(navigateTo(storeInstance.getState().route)))

	navigation.start(storeInstance.dispatch)

	function renderRootComponent () {
		const { app, route, page } = storeInstance.getState()
		try {
			const component = loaderInstance.load(`./${route.collection}/${route.action || defaultAction}.jsx`)
			storeInstance.setComponentReducer(component.reducer)
			const dom = component({ app, route, ...page, dispatch: storeInstance.dispatch })
			if (dom) {
				render(dom, root)
			}
		} catch (e) {
			if (e instanceof loader.NotFoundError && !isSameRoute(route, defaultRoute)) {
				storeInstance.dispatch(navigateTo(defaultRoute))
			} else {
				throw e
			}
		}
	}
}

function isSameRoute (lhs, rhs) {
	return lhs.collection == rhs.collection
		&& (lhs.action || defaultAction) == (rhs.action || defaultAction)
		&& lhs.id == rhs.id
		&& isEqual(lhs.query || defaultQuery, rhs.query || defaultQuery)
}