const loader = require('./loader')
const store = require('./store')
const page = require('./page')

const navigation = require('./navigation')
const restApi = require('./rest-api')
const scope = require('./scope')

module.exports = {
	start,
	scope,
	actions: {
		...navigation.actions,
		...restApi.actions,
	},
	restApiErrorInterceptor: restApi.errorInterceptor,
	createRouteReducer: navigation.createRouteReducer,
}

function start ({
	createContext,
	acceptHotUpdate,

	defaultRoute,

	routeReducer,
	appReducer,

	middleware,
	containerDomNode,
}) {
	const storeInstance = store.create({
		routeReducer: routeReducer || navigation.createRouteReducer({ defaultRoute }),
		appReducer,
		middleware,
	})
	const loaderInstance = loader.create({ createContext, acceptHotUpdate })
	containerDomNode = containerDomNode || document.getElementById('root')

	storeInstance.subscribe(() => page.render({ storeInstance, loaderInstance, containerDomNode }))
	loaderInstance.subscribe(() => storeInstance.dispatch({ type: 'HOT_RELOAD' }))

	navigation.start(storeInstance.dispatch)
}