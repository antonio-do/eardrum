import React from 'react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import {
  Switch,
  Route,
  useRouteMatch,
} from "react-router-dom";

import LeaveDetail from './LeaveDetail';
import LeaveMainPage from './LeaveMainPage';

const LeaveApp = () => {
  let { path } = useRouteMatch();

  return (
    <div>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Switch>
          <Route exact path={`${path}/:leaveId`} component={LeaveDetail}/>
          <Route exact path={path} component={LeaveMainPage}/>
        </Switch>
      </MuiPickersUtilsProvider>
    </div>
  )
}

export default LeaveApp;
