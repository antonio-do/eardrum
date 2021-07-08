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
  const leaveContext = useLeaveContext();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!leaveContext.data && leaveContext.error) {
      console.error(leaveContext.error);
      message.error('Errors occured while fetching context!');
    }
  }, [leaveContext.data, leaveContext.loading, leaveContext.error])

  useEffect(() => {
    if (!currentUser.data && currentUser.error) {
      console.error(currentUser.error);
      message.error('Errors occured while fetching current user!');
    }
  }, [currentUser.data, currentUser.loading, currentUser.error])

  if (currentUser.loading || leaveContext.loading) return <Spin size="large"/>

  if (currentUser.error || leaveContext.error) return <div>Something went wrong</div>
  
  return (
    <div>
      <LeaveContext.Provider 
        value={{
          currentUser: currentUser.data.data,
          allUsers: leaveContext.data.data.users,
          leaveTypes: leaveContext.data.data.leave_types,
          //dictionary that map the name of leave type to its label (i.e. work_from_home => Work From Home)
          leaveTypesMap: leaveContext.data.data.leave_types.reduce((acc, cur) => {
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
