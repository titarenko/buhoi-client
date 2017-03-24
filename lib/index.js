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
	RestRequestError: restApi.RestRequestError,
}

function start ({
	createContext,
	acceptHotUpdate,

	defaultRoute,
	loginRoute,

	routeReducer,
	appReducer,

	middleware,
	containerDomNode,
}) {
	const storeInstance = store.create({
		routeReducer: routeReducer || navigation.createRouteReducer({ defaultRoute, loginRoute }),
		appReducer,
		middleware,
	})
	const loaderInstance = loader.create({ createContext, acceptHotUpdate })

	storeInstance.subscribe(() => setTimeout(renderPage, 0))
	loaderInstance.subscribe(() => storeInstance.dispatch({ type: 'HOT_RELOAD' }))

	navigation.start(storeInstance.dispatch)

	function renderPage () {
		page.render({
			storeInstance,
			loaderInstance,
			containerDomNode: containerDomNode || document.getElementById('root'),
		})
	}
}