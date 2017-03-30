const urlParse = require('url-parse')
const queryString = require('querystring')
const isEqual = require('lodash.isequal')

module.exports = { parse, stringify, isSame }

function parse (url) {
	if (typeof url != 'string') {
		return url
	}
	const parsed = urlParse(url, true)
	const tokens = parsed.pathname.slice(1).split('/')
	return {
		entity: tokens[0],
		action: tokens[1],
		id: tokens[2],
		query: parsed.query,
	}
}

function stringify (route) {
	if (typeof route == 'string') {
		return route
	}
	const { entity, id, action, query } = route
	return '/' + [
		[entity, action, id].filter(Boolean).join('/'),
		query ? queryString.stringify(omitUndefined(query)) : null,
	].filter(Boolean).join('?')
}

function isSame (lhs, rhs, skipQuery) {
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

function omitUndefined (obj) {
	return Object.entries(obj).reduce(
		(newObj, pair) => pair[1] !== undefined ? { ...newObj, [pair[0]] : pair[1] } : newObj,
		{ }
	)
}