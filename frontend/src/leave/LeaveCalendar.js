import React, { Fragment, useEffect, useState } from "react";
import { DatePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { 
    Card, 
    CardContent, 
    Chip, 
    Divider, 
    List, 
    ListItem, 
    ListItemText, 
    ListSubheader, 
    makeStyles, 
    Paper, 
    TextField, 
    Tooltip,
    Typography,
} from "@material-ui/core";
import { useHolidays, useLeaveUsers } from "./hooks";
import { message } from "antd";
import moment from "moment";
import { DATE_FORMAT } from "./constants";

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

const StaticDatePicker = ({signal}) => {
    const [date, setDate] = useState(new Date());
    const [holidays, setHolidays] = useState([]);
    const [leaveUsers, setLeaveUsers] = useState([])
    const [year, setYear] = useState(new Date().getFullYear());
    const fetchHoliday = useHolidays();
    const fetchLeaveUsers = useLeaveUsers();

    const classes = useStyles();

    useEffect(() => {
        fetchLeaveUsers.execute({date: moment().format("YYYYMMDD")})
    }, [])

    useEffect(() => {
        fetchHoliday.execute({year: year});
    }, [year])

    useEffect(() => {
        if (!fetchHoliday.loading) return;
        if (fetchHoliday.error) {
            console.error(fetchHoliday.error);
            message.error("Error fetching holidays.");
        } else if (fetchHoliday.data) {
            setHolidays(fetchHoliday.data)            
        }
    }, [fetchHoliday.loading, fetchHoliday.data, fetchHoliday.error])

    useEffect(() => {
        fetchLeaveUsers.execute({date: moment(date).format("YYYYMMDD")});
    }, [date, signal])

    useEffect(() => {
        if (!fetchLeaveUsers.loading) return;
        if (fetchLeaveUsers.error) {
            console.error(fetchHoliday.error);
            message.error("Error fetching leave users.");
        } else if (fetchLeaveUsers.data) {
            setLeaveUsers(fetchLeaveUsers.data)
        }
    }, [fetchLeaveUsers.loading, fetchLeaveUsers.data, fetchLeaveUsers.error])

    // render holidays differently
    const renderDay = (day, selectedDate, dayInCurrentMonth, dayComponent) => { 
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
            <Paper>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker
                        autoOk
                        orientation="portrait"
                        variant="static"
                        openTo="date"
                        value={date}
                        renderDay={renderDay}
                        onChange={setDate}
                    />
                </MuiPickersUtilsProvider>
            </Paper>
            <Divider/>
            <ListSubheader className={classes.list}>Users on leave</ListSubheader>
            <Paper style={{overflow: 'auto'}}>
                <List>
                    {leaveUsers.map(item => (
                        <Fragment>
                            <Card style={{display: 'flex', flexWrap: 'wrap', maxWidth: '310px'}}>
                                <CardContent style={{padding: 5}}>
                                    <Fragment>
                                        <Typography variant="h6" className={classes.chips}>{item.group}</Typography>
                                        {item.users.map(user => 
                                            ((user.status != '') && <Tooltip title={user.status} >
                                                <Chip label={user.name} className={classes.chips}/>
                                            </Tooltip>)
                                        )}
                                    </Fragment>
                                </CardContent>
                            </Card>
                            <Divider/>
                        </Fragment>
                    ))}
                </List>
            </Paper>
            <ListSubheader className={classes.list}>Holidays</ListSubheader>
            <Paper>
                <div className={classes.yearInput}>
                    <TextField 
                        label="Year" 
                        type="number" 
                        defaultValue={year} 
                        fullWidth
                        onChange={(event) => setYear(event.target.value)}
                    />
                </div>
                <List>
                    {holidays.map(item => 
                        (<Fragment>
                            <ListItem>
                                <ListItemText 
                                    primary={moment(item.date).format(DATE_FORMAT.LABEL)} 
                                    secondary={
                                        moment(item.date).diff(moment().startOf('day'), 'days') < 0 
                                            ? "Passed"
                                            : `${moment(item.date).diff(moment().startOf('day'), 'days')} day(s) left`
                                    } />
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
