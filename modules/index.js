const navigation = require('./navigation')
const loader = require('./loader')
const store = require('./store')

const { navigateTo, setQueryParams } = navigation
const isEqual = require('lodash.isequal')
const { render } = require('inferno')

const { combineReducers } = require('redux')
const { createScopedReducer, createScopedDispatch } = require('./utils')

module.exports = {
	start,

	navigateTo,
	setQueryParams,

	combineReducers,

	createScopedReducer,
	createScopedDispatch,

	request: require('./request'),
	rest: require('./rest'),
}

function start ({
	container,

	createContext,
	acceptHotUpdate,

	appReducer = (state = null, action_) => state,
	additionalMiddleware = [],

	defaultRoute,
}) {
	const root = container || document.getElementById('root')

	const loaderInstance = loader.create({ createContext, acceptHotUpdate })
	const storeInstance = store.create({ appReducer, additionalMiddleware })

	storeInstance.subscribe(() => setTimeout(renderRootComponent, 0))
	loaderInstance.subscribe(() => storeInstance.dispatch(navigateTo(storeInstance.getState().route)))

	navigation.setDefaultRoute(defaultRoute)
	navigation.start(storeInstance.dispatch)

	function renderRootComponent () {
		const { app, route, page, version } = storeInstance.getState()

		const routeIsSame = isSameRoute(route, route.previous, true)
		const pageStateIsReset = version.clean && version.dirty < version.clean

		if (!routeIsSame && !pageStateIsReset) {
			storeInstance.dispatch({ type: 'RESET_PAGE_STATE' })
			return
		}

		try {
			const component = loaderInstance.load(`./${route.entity}/${route.action || 'index'}.jsx`)
			storeInstance.setComponentReducer(component.reducer)
			const dom = component({
				app,
				route,
				...page,
				dispatch: storeInstance.dispatch,
			})
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

function isSameRoute (lhs, rhs, skipQuery) {
	if (!lhs && rhs || lhs && !rhs) {
		return false
	}
	if (lhs == null && rhs == null) {
		return true
	}
	return lhs.entity == rhs.entity
		&& (lhs.action || null) == (rhs.action || null)
		&& lhs.id == rhs.id
		&& (skipQuery || isEqual(lhs.query || null, rhs.query || null))
}