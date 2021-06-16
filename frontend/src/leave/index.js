import { Box, Button, Grid, makeStyles, Paper } from '@material-ui/core';
import React, { useState } from 'react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import {
  Switch,
  Route,
  useRouteMatch,
  Link,
} from "react-router-dom";

import LeaveDetail from './LeaveDetail';
import LeaveCalendar from './LeaveCalendar';
import LeaveList from './LeaveList';
import LeaveStat from './LeaveStat';
import { DatePicker } from "@material-ui/pickers";

// Note: makeStyles must be imported from @material-ui/core to use theme.spacing or theme.breakpoints
// TODO: refactor layout in src/App.js
const useStyles = makeStyles(theme => ({
  root: {
    width: 'auto',
    // (150% - 100%)/(2 * 150%) = 16.66667%
    [theme.breakpoints.up(1500)]: {
      width: "150%",
      transform: 'translate(-16.66667%, 0)',
    },
    // (125% - 100%)/(2 * 125%) = 10%
    [theme.breakpoints.between(1250, 1500)]: {
      width: "125%",
      transform: 'translate(-10%, 0)',
    },
    paddingTop: theme.spacing(2), 
    paddingBottom: theme.spacing(10),
  },
}))

const LeaveApp = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date());

  let { path } = useRouteMatch();

  const classes = useStyles();

  const mainApp = () => (
    <Grid container spacing={5}>
      <Grid item xs={12} style={{ textAlign: 'end'}}>
        <Button to='/leave/new' color="primary" variant="contained" component={ Link }>New</Button>
      </Grid>
      <Grid item >
        <LeaveCalendar/>
      </Grid>
      <Grid item style={{flexGrow: 1}}>
        <Box>
          <DatePicker
            views={["year"]}
            label="View data in: "
            value={date}
            onChange={setDate}
            style={{width: '100%'}}
            onYearChange={(date) => setYear(date.getFullYear())}
            autoOk
          />
        </Box>
        <LeaveStat year={year}/>
        <LeaveList year={year}/>
      </Grid>
    </Grid>
  )
  return (
    <div className={classes.root}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Switch>
          <Route exact path={`${path}/:leaveId`} component={LeaveDetail}/>
          <Route exact path={path} component={mainApp}/>
        </Switch>
      </MuiPickersUtilsProvider>
    </div>
  )
}

export default LeaveApp;
