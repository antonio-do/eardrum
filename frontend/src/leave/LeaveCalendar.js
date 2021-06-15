import React, { Fragment, useEffect, useState } from "react";
import { DatePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { Divider, List, ListItem, ListItemText, ListSubheader, makeStyles, Paper } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    root: {
        justifyContent: 'space-between',
    },
    list: {
        backgroundColor: theme.palette.primary.main,
        color: "white",
    }
}))

const StaticDatePicker = () => {
  const [date, setDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [leaveUsers, setLeaveUsers] = useState([])

  const classes = useStyles();

  const dateFns = new DateFnsUtils();

  useEffect(() => {
      getHolidays();
      handleChangeDate(new Date());
  }, [])

  const getHolidays = () => {
    //TODO: replace mock data
    setHolidays([
        { "id": 1, "date": new Date(2021, 5, 14), "title": "some name" },
        { "id": 2, "date": new Date(2021, 5, 15), "title": "some name 2" },
        { "id": 3, "date": new Date(2021, 5, 16), "title": "some name 3" },
        { "id": 4, "date": new Date(2021, 5, 17), "title": "some name 4" },
    ])
  }

  const handleChangeDate = (date) => {
    setDate(date);
    // TODO: set users on leave on that day
    setLeaveUsers(["Alice", "Bob", "Mallory"]);
  }

  const renderDay=(day, selectedDate, dayInCurrentMonth, dayComponent) => { 
    const isHoliday = (day) => {
        return holidays.find(item => {return item.date.getTime() == day.getTime()});
    }
    if (day.getTime() === selectedDate.getTime()) {
        return React.cloneElement(dayComponent, {style: {textDecorationLine: 'underline'}});
    }
    if (isHoliday(day)) {
        return React.cloneElement(dayComponent, {style: {color: "green", textDecorationLine: 'underline'}});
    }
    return dayComponent;
  };

  return (
    <Paper className={classes.root}>
        {/* The calendar */}
        <Paper>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                    autoOk
                    orientation="portrait"
                    variant="static"
                    openTo="date"
                    value={date}
                    renderDay={renderDay}
                    onChange={handleChangeDate}
                />
            </MuiPickersUtilsProvider>
        </Paper>
        <Divider/>
        {/* The list of user on leave */}
        <ListSubheader className={classes.list}>Users on leave</ListSubheader>
        <Paper style={{maxHeight: 200, overflow: 'auto'}}>
            <List>
                {leaveUsers.map(user => 
                    (<Fragment>
                        <ListItem>
                            <ListItemText primary={user} />
                        </ListItem>
                        <Divider/>
                    </Fragment>)
                )}
            </List>
        </Paper>
        {/* The list of holidays */}
        <ListSubheader className={classes.list}>Holidays</ListSubheader>
        <Paper>
            <List>
                {holidays.map(item => 
                    (<Fragment>
                        <ListItem>
                            <ListItemText 
                                primary={dateFns.format(item.date, "dd/MM/yyyy")} 
                                secondary={item.title} />
                        </ListItem>
                        <Divider/>
                    </Fragment>)
                )}
            </List>
        </Paper>
    </Paper>
  );
};

export default StaticDatePicker;
