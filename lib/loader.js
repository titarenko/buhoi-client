const util = require('util')

module.exports = { create, NotFoundError }

function create ({ createContext, acceptHotUpdate }) {
	let context = createContext()

	return { load, subscribe }

	function load (name) {
		try {
			return context(name)
		} catch (e) {
			if (e.message == `Cannot find module '${name}'.`) {
				throw new NotFoundError(e)
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

function NotFoundError (e) {
	Error.call(this, e.message)
	Error.captureStackTrace(this, NotFoundError)
}

util.inherits(NotFoundError, Error)