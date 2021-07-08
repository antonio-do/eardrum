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
      console.error(leaveContextError);
      message.error('Errors occured while fetching context!');
    }
  }, [leaveContextResponse, leaveContextLoading, leaveContextError])

  useEffect(() => {
    if (!getUserResponse && getUserError) {
      console.error(getUserError);
      message.error('Errors occured while fetching current user!');
    }
  }, [getUserResponse, getUserLoading, getUserError])

  if (getUserLoading || leaveContextLoading) return <Spin size="large"/>

  if (getUserError || leaveContextError) return <div>Something went wrong</div>
  
  return (
    <div>
      <LeaveContext.Provider 
        value={{
          currentUser: getUserResponse.data,
          allUsers: leaveContextResponse.data.users,
          leaveTypes: leaveContextResponse.data.leave_types,
          //dictionary that map the name of leave type to its label (i.e. work_from_home => Work From Home)
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
