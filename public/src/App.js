import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import {Toolbar, ToolbarGroup, ToolbarSeparator} from 'material-ui/Toolbar'
import TextField from 'material-ui/TextField'
import CircularProgress from 'material-ui/CircularProgress'
import Snackbar from 'material-ui/Snackbar'
import ActionLock from 'material-ui/svg-icons/action/lock';

import { connect } from 'react-redux'
import { createSession, joinSession, listVotes, vote, clearSession, setSnackbarState } from './store/actions'

import URL from 'url-parse'


class App extends Component {
  constructor(props) {
    super(props)

    const url = new URL(document.location.href, true)
    this.state = {
      sessionKey: url.query.session || null,
      user: null,
      showVotes: false,
      currentVote: null
    }
  }

  clearSession = () => {
    this.setState({currentVote: null})
    this.props.clearSession(this.state.sessionKey)
  }

  createSession = () => this.props.createSession(this.state.user)

  joinSession = () => this.props.joinSession(this.state.sessionKey, this.state.user)

  vote = (value) => {
    this.setState({currentVote: value})
    this.props.vote(this.props.session, this.state.user, value)
  }

  showVotes = () => {
    this.setState({showVotes: true})
    this.props.listVotes(this.props.session)
  }

  setSessionKey = (event) => this.setState({sessionKey: event.target.value})
  setUser = (event) => this.setState({user: event.target.value})

  render() {
    const voteButtons = [0.5, 1, 2, 3, 5, 8].map(v =>
      <li className="voteButton" key={v}>
        <FloatingActionButton onClick={this.vote.bind(this, v)} secondary={this.state.currentVote === v}>
          <span className="voteButtonText">{v}</span>
        </FloatingActionButton>
      </li>)
    
    const getUserVote = user => (this.props.votes.find(v => v.user === user) || {value: null}).value
    const renderUserVote = user => {
      let vote = getUserVote(user)
      if (this.state.showVotes)
        return <span className="value">&nbsp;{vote}</span>

      if (this.state.user !== user && vote)
        vote = <ActionLock style={{width: '18px', height: '18px'}}/>
      return <span className="value">&nbsp;{vote}</span>
    }
    const users = this.props.users.sort().map(user =>
      <li key={user} className="userItem">
        <span className="user">{user}</span>
        {renderUserVote(user)}
      </li>)

    const fVotes = this.props.votes.filter(v => v.value)
    const voteMap = fVotes.map(v => v.value).reduce((agg, v) => ((agg[v] = (agg[v] || 0) + 1), agg), {})
    const results = [
      {label: 'Average:', value: fVotes.reduce((sum, v) => sum += v.value, 0) / fVotes.length},
      ...Object.keys(voteMap).sort((a, b) => +a - +b).map(k => ({label: `Points ${k}:`, value: `${voteMap[k]} votes`}))
    ].map(r =>
      <div key={r.label} className="result">
        <span>{r.label}</span>
        <span>{r.value}</span>
      </div>)

    return (
      <MuiThemeProvider>
        <Paper zDepth={1} className="container">
          <Toolbar>
            <ToolbarGroup>
              <TextField hintText="user" style={{width: '100px'}} onBlur={this.setUser}/>
            </ToolbarGroup>
            <ToolbarGroup lastChild={true}>
              {this.state.sessionKey ? null : <TextField hintText="session" style={{width: '50px'}} onBlur={this.setSessionKey}/>}
              <RaisedButton label="Join session" primary={true} onClick={this.joinSession} disabled={!this.state.user}/>
              <ToolbarSeparator style={{margin: '0 12px'}}/>
              <RaisedButton label="New session" secondary={true} onClick={this.createSession} disabled={!this.state.user}/>
            </ToolbarGroup>
          </Toolbar>
          <div className="usersBlock">
            <ul className="userList">
              {users}
            </ul>
            {this.props.users.length ? <RaisedButton label="Show votes" onClick={this.showVotes} style={{marginRight: '24px'}}/> : null}
            {this.props.users.length ? <RaisedButton label="Clear votes" onClick={this.clearSession}/> : null}
          </div>
          {this.props.users.length ? <ul className="voteButtonList">
            {voteButtons}
          </ul> : null}
          {this.state.showVotes ? <div className="results">
            {results}
          </div> : null}
          { this.props.loading ? <CircularProgress /> : null }
          <Snackbar
            open={this.props.snackbar.isVisible}
            message={this.props.snackbar.message}
            autoHideDuration={4000}
            onRequestClose={() => this.props.setSnackbarState(false)}
          />
        </Paper>
      </MuiThemeProvider>
    )
  }
}

function mapStateToProps(state) {
  return {
    session: (state.session && state.session.session) || '',
    users: state.voteList.users || [],
    votes: state.voteList.votes || [],
    loading: state.isLoading,
    snackbar: state.snackbar,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    createSession: (user) => dispatch(createSession(user)),
    joinSession: (session, user) => dispatch(joinSession(session, user)),
    listVotes: (session) => dispatch(listVotes(session)),
    vote: (session, user, value) => dispatch(vote(session, user, value)),
    clearSession: (session) => dispatch(clearSession(session)),
    setSnackbarState: (isVisible, message='') => dispatch(setSnackbarState(isVisible, message))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)