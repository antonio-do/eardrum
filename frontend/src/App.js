import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { compose } from 'redux';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  Switch,
} from "react-router-dom";

import FAQ from './views/FAQ';
import SignInView from './views/SignInView';
import RequestList from './views/RequestList';
import RequestDetails from './views/RequestDetails';
import OKRList from './views/OKRList';
import OKRDetail from './views/OKRDetail';

import { signOut, getCurrentUser, accountFetchAll, } from './actions/index';
import { configFetchGradeOptions } from './actions';

import WithLongPolling from './core/WithLongPolling';
import Notifier from './core/Notifier';


const styles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  appBar: {
    position: 'relative',
  },
  toolbarTitle: {
    flex: 1,
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(1000 + theme.spacing.unit * 3 * 2)]: {
      width: 1000,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`,
  },
  cardHeader: {
    backgroundColor: theme.palette.grey[200],
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing.unit * 2,
  },
  cardActions: {
    [theme.breakpoints.up('sm')]: {
      paddingBottom: theme.spacing.unit * 2,
    },
  },
  footer: {
    marginTop: theme.spacing.unit * 8,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit * 6}px 0`,
  },
  navButton: {
    marginLeft: theme.spacing.unit,
  }
});


function LinkTab(props) {
  return (
    <Tab
      component={ Link }
      {...props}
    />
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: this.getCurrentTab(),
    }

  }

  onSignOut = () => {
    this.props.dispatch(signOut());
  }

  onChangeTab = (event, newValue) => {
    this.setState({tabValue: newValue});
  }

  componentDidUpdate() {
    // TODO: Actually this is a mystery thing where I could not use this hook to update tabValue state.
  }

  getCurrentTab = () => {
    const urlMap = [
      [RegExp('^/requests'), 'home'],
      [RegExp('^/okrs'), 'okrs'],
      [RegExp('^/other'), 'other'],
      // [RegExp(''), 'home'],
    ]
    for(let i = 0; i < urlMap.length; i++) {
      if (window.location.pathname.match(urlMap[i][0]) !== null) {
        return urlMap[i][1];
      }
    }
    return 'home';
  }

  render() {
    const { classes } = this.props;

    const PrivateRoute = ({ component: Component, ...rest }) => {
      return (
        <Route
          {...rest}
          render={props =>
            this.props.auth.is_authenticated ? (
              <Component {...props} />
            ) : (
              <Redirect
                to={{
                  pathname: "/signin",
                  state: { from: props.location }
                }}
              />
            )
          }
        />
      );
    }

    const SignInRoute = ({ component: Component, ...rest }) => {
      return (
        <Route
          {...rest}
          render={props =>
            !this.props.auth.is_authenticated ? (
              <Component {...props} exact={ true }/>
            ) : (
              <Redirect
                to={{
                  pathname: "/",
                  state: { from: props.location }
                }}
              />
            )
          }
        />
      );
    }

    return (
      <Router>
        <React.Fragment>
          <CssBaseline />
          <Notifier/>
          <AppBar position="static" color="default" className={ classes.appBar }>
            <Toolbar>
              <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
                <Button component={ Link } to='/' onClick={ () => this.onChangeTab(null, 'home') }>Eardrum</Button>
              </Typography>
              { (!this.props.auth.is_authenticated) && 
                (
                  <Button to='/signin' color="primary" component={ Link } variant="outlined">Sign In</Button>
                ) }
              { (this.props.auth.is_authenticated) &&
                (
                  <React.Fragment>
                    <Tabs value={ this.state.tabValue } onChange={ this.onChangeTab }>
                      <LinkTab label="Home" to="/" value='home' />
                      <LinkTab label="OKR" to="/okrs" value='okrs'/>
                      <LinkTab label="Other" to='/other' value='other'/>
                    </Tabs>
                    <Button to='/' color="primary" variant="outlined" component={ Link } onClick={ this.onSignOut }>Sign Out</Button>
                  </React.Fragment>
                )
              }
              <Button href='/admin/login/' color="primary" variant="outlined" target="_blank" className={ classes.navButton }>Admin pages</Button>
            </Toolbar>
          </AppBar>
          <main className={ classes.layout }>
            <Switch>
              <SignInRoute path="/signin" component={ SignInView } />
              <PrivateRoute exact={ true } path="/" component={ RequestList } />
              <PrivateRoute exact={ true } path="/other" component={ FAQ } />
              <PrivateRoute exact={ true } path="/okrs/:okrId" component={ OKRDetail } />
              <PrivateRoute exact={ true } path="/okrs" component={ OKRList } />
              <PrivateRoute path="/requests/:requestId/details" component={ RequestDetails } />
            </Switch>
          </main>

        </React.Fragment>
      </Router>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
})

const mapDispatchToProps = dispatch => ({
  dispatch,
})

const pollingJobProducer = (props) => {
  const configFetchGradeOptionsFunc = () => props.dispatch(configFetchGradeOptions());
  const fetchUsers = () => {
      props.dispatch(getCurrentUser());
      props.dispatch(accountFetchAll());
  }
  const repeatUntilTrue = () => {
    if (props.auth.is_authenticated) {
      fetchUsers();
    } else {
      setInterval(repeatUntilTrue, 1000);
    }
  }
  return {
    funcs: [configFetchGradeOptionsFunc, repeatUntilTrue],
    workers: [setInterval(configFetchGradeOptionsFunc, 10*60*1000)],
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  WithLongPolling(pollingJobProducer),
  withStyles(styles),
)(App);
