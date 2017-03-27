module.exports = { createReducer, createDispatch }

function createReducer (scope, reducer) {
	return (state, action) => state === undefined || action.scope === scope
		? reducer(state, action.scope === scope || action.scope === undefined
			? action
			: Object.assign({ }, action, { type: 'SCOPE_VIOLATION_FOR_SAKE_OF_INITIALIZATION' })
		)
		: state
}

function createDispatch (scope, dispatch) {
	return action => typeof action == 'function'
		? dispatch((thunkDispatch, ...thunkExtraArgs) => action(
			createDispatch(scope, thunkDispatch),
			...thunkExtraArgs
		))
		: dispatch({ ...action, scope })
}