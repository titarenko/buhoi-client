module.exports = { createScopedReducer, createScopedDispatch }

function createScopedReducer (reducer, scope) {
	return (state, action) => state === undefined || action.scope == scope
		? reducer(state, action)
		: state
}

function createScopedDispatch (dispatch, scope) {
	return action => typeof action == 'function'
		? dispatch(createScopedDispatch(action, scope))
		: dispatch({ ...action, scope })
}