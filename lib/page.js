const { render } = require('inferno')
const { isSame } = require('./route')
const { NotFoundError } = require('./loader')
const { actions: { navigateTo } } = require('./navigation')

module.exports = { render: renderPage }

function renderPage ({ storeInstance, loaderInstance, containerDomNode }) {
	const { route, app, page, version } = storeInstance.getState()

	const routeIsSame = isSame(route, route.previous, true)
	const isPageStateReset = version.clean && version.dirty < version.clean

	try {
		const component = loaderInstance.load(`./${route.entity}/${route.action || 'index'}.jsx`)
		storeInstance.setComponentReducer(component.reducer)

		if (!routeIsSame && !isPageStateReset) {
			storeInstance.dispatch({ type: 'RESET_PAGE_STATE' })
			return
		}

		const virtualNode = component({
			route,
			app,
			...page,
			dispatch: storeInstance.dispatch,
		})

		if (virtualNode) {
			render(virtualNode, containerDomNode)
		}
	} catch (e) {
		if (e instanceof NotFoundError) {
			storeInstance.dispatch(navigateTo())
		} else {
			throw e
		}
	}
}