import { combineReducers } from 'redux'
import { CREATE_SESSION,
	RECEIVE_VOTE_LIST,
	CLEAR_VOTE_LIST,
	VOTE,
	JOIN_SESSION,
	SET_LOADING_STATE, SET_SNACKBAR_STATE } from './actions'

function session(state=null, action) {
	switch (action.type) {
		case CREATE_SESSION:
			return action.session
		case JOIN_SESSION:
			return action.session
		default:
			return state
	}
}

function voteList(state={votes: [], users: []}, action) {
	switch (action.type) {
		case RECEIVE_VOTE_LIST:
			return action.votes
		case CLEAR_VOTE_LIST:
			return {...state, votes: []}
		case VOTE:
			return {...state,
					votes: state.votes
						.filter(v => v.user !== action.vote.user)
						.concat([action.vote])}
		default:
			return state
	}
}

function isLoading(state=false, action) {
	switch (action.type) {
		case SET_LOADING_STATE:
			return action.isLoading
		default:
			return state
	}
}

function snackbar(state={isVisible: false, message: ''}, action) {
	switch (action.type) {
		case SET_SNACKBAR_STATE:
			return {
				isVisible: action.isVisible,
				message: action.message
			}
		default:
			return state
	}
}

const rootReducer = combineReducers({
	session,
	voteList,
	isLoading,
	snackbar
})

export default rootReducer