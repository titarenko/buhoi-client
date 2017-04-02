module.exports = { create }

function create ({ createContext, acceptHotUpdate }) {
	let context = createContext()

	return { load, subscribe }

	function load (name) {
		try {
			return context(name)
		} catch (e) {
			if (e.message == `Cannot find module '${name}'.`) {
				return null
			} else {
				throw e
			}
		}
	}

	function subscribe (updateHandler) {
		if (!acceptHotUpdate) {
			return
		}
		acceptHotUpdate(context.id, function () {
			context = createContext()
			updateHandler()
		})
	}
}