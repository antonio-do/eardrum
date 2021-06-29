import React, { useEffect } from 'react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import {
  Switch,
  Route,
  useRouteMatch,
} from "react-router-dom";
import LeaveDetail from './LeaveDetail';
import LeaveMainPage from './LeaveMainPage';
import { LeaveContext, useCurrentUser, useLeaveContext } from './hooks';
import { message, Spin } from 'antd';

const LeaveApp = () => {
  let { path } = useRouteMatch();
  const [leaveContextLoading, leaveContextResponse, leaveContextError] = useLeaveContext();
  const [getUserLoading, getUserResponse, getUserError] = useCurrentUser();

  useEffect(() => {
    if (!leaveContextResponse && leaveContextError) {
      console.log(leaveContextError);
      message.error('Errors occured while fetching context!');
    }
  }, [leaveContextResponse, leaveContextLoading, leaveContextError])

  useEffect(() => {
    if (!getUserResponse && getUserError) {
      console.log(getUserError);
      message.error('Errors occured while fetching current user!');
    }
  }, [getUserResponse, getUserLoading, getUserError])

  if (getUserLoading || leaveContextLoading) return <Spin size="large"/>
  return (
    <div>
      <LeaveContext.Provider 
        value={{
          currentUser: getUserResponse.data,
          allUsers: leaveContextResponse.data.users,
          leaveTypes: leaveContextResponse.data.leave_types,
          leaveTypesMap: leaveContextResponse.data.leave_types.reduce((acc, cur) => {
            let next = {...acc}; 
            next[cur.name] = cur.label; 
            return next;
          }, {}),
        }}
      >
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Switch>
            <Route exact path={`${path}/new`} component={LeaveDetail}/>
            <Route exact path={path} component={LeaveMainPage}/>
          </Switch>
        </MuiPickersUtilsProvider>
      </LeaveContext.Provider>
    </div>
  )
}

export default LeaveApp;
