import React, { Fragment, useEffect, useState } from "react";
import { DatePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { Card, CardActions, CardContent, CardHeader, Chip, Dialog, DialogTitle, Divider, IconButton, List, ListItem, ListItemText, ListSubheader, makeStyles, Paper, TextField } from "@material-ui/core";
import MoreHoriz from '@material-ui/icons/MoreHoriz';

const useStyles = makeStyles(theme => ({
    root: {
        justifyContent: 'space-between',
    },
    list: {
        backgroundColor: theme.palette.primary.main,
        color: "white",
    },
    yearInput: {
        padding: theme.spacing(2)
    },
    chips: {
        margin: theme.spacing(0.5)
    }
}))

const StaticDatePicker = () => {
  const [date, setDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [group, setGroup] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [leaveUsers, setLeaveUsers] = useState([])
  const [year, setYear] = useState(new Date().getFullYear());

  const classes = useStyles();

  const dateFns = new DateFnsUtils();

  useEffect(() => {
      getHolidays(year);
      handleChangeDate(new Date());
  }, [])

  const getHolidays = (year) => {
    //TODO: replace mock data
    setHolidays([
        { "id": 1, "date": new Date(year, 5, 14), "title": "some name" },
        { "id": 2, "date": new Date(year, 5, 15), "title": "some name 2" },
        { "id": 3, "date": new Date(year, 5, 16), "title": "some name 3" },
        { "id": 4, "date": new Date(year, 5, 17), "title": "some name 4" },
    ])
  }

  const handleChangeDate = (date) => {
    setDate(date);
    // TODO: set users on leave on that day
    setLeaveUsers([{
        group: "Group 1",
        users: ["Alice", "Bob", "Mallory", "Valentine", "Maria", "Lord"],
    }, { 
        group: "Group 2",
        users: ["Alice", "Bob", "Mallory", "Valentine", "Maria", "Lord"],
    }, { 
        group: "Group 3",
        users: ["Alice", "Bob", "Mallory", "Valentine", "Maria", "Lord"],
    }, { 
        group: "Group 4",
        users: ["Alice", "Bob", "Mallory", "Valentine", "Maria", "Lord"],
    }, { 
        group: "Group 5",
        users: ["Alice", "Bob", "Mallory", "Valentine", "Maria", "Lord"],
    }, ]);
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

  const handleClickChip = (group) => {
      
  }

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
        <Paper style={{overflow: 'auto'}}>
            <List>
                {leaveUsers.map(item => (
                    <Fragment>
                        <Card style={{display: 'flex', flexWrap: 'wrap', maxWidth: '310px'}}>
                            <CardContent style={{padding: 5}}>
                                <Fragment>
                                    <div className={classes.chips}>{item.group}</div>
                                    {item.users.map(user => 
                                        (<Chip label={user} className={classes.chips}/>)
                                    )}
                                    <Chip onClick={() => handleClickChip(item.group)} label="More..." variant="outlined" color="primary" className={classes.chips}/>
                                </Fragment>
                            </CardContent>
                        </Card>
                        <Divider/>
                    </Fragment>
                ))}
            </List>
        </Paper>
        <Dialog open={openDialog} onClose={setOpenDialog}>
            <Fragment>
                {/* <div className={classes.chips}>{group}</div>
                {item.users.map(user => 
                    (<Chip label={user} className={classes.chips}/>)
                )}
                <Chip onClick={() => handleClickChip(item.group)} label="More..." variant="outlined" color="primary" className={classes.chips}/> */}
            </Fragment>
        </Dialog>
        {/* The list of holidays */}
        <ListSubheader className={classes.list}>Holidays</ListSubheader>
        <div className={classes.yearInput}>
            <TextField 
                label="Year" 
                type="number" 
                defaultValue={year} 
                fullWidth
                onChange={(event) => {
                    setYear(event.target.value);
                    getHolidays(event.target.value);
                }}
            />
        </div>
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
