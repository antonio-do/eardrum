import React, { Fragment, useEffect, useState } from "react";
import { DatePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { 
    Card, 
    CardContent, 
    Chip, Divider, 
    List, ListItem, 
    ListItemText, 
    ListSubheader, 
    makeStyles, Paper, 
    TextField, Typography
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
        fetchLeaveUsers.get(moment().format("YYYYMMDD"))
    }, [])

    useEffect(() => {
        fetchHoliday.get(year);
    }, [year])

    useEffect(() => {
        if (!fetchHoliday.loading) return;
        if (fetchHoliday.error) {
            console.error(fetchHoliday.error);
            message.error("Error fetching holidays.");
        } else if (fetchHoliday.response) {
            let unsortedHolidays = fetchHoliday.response.map((item) => ({
                "id" : item,
                "date": moment(item, DATE_FORMAT.VALUE).toDate(),
            }))

            unsortedHolidays.sort((holiday1, holiday2) => {
                let dif1 = moment(holiday1.date).diff(moment().startOf('day'), 'days');
                let dif2 = moment(holiday2.date).diff(moment().startOf('day'), 'days');
                // if today is between holiday1 and holiday2
                if (dif1 < 0 ^ dif2 < 0) return dif1 < dif2 ? 1 : -1;
                // if today is either sooner or later than both holiday1 and holiday2
                return dif1 < dif2 ? -1 : 1
            });

            setHolidays(unsortedHolidays)            
        }
    }, [fetchHoliday.loading, fetchHoliday.response, fetchHoliday.error])

    useEffect(() => {
        fetchLeaveUsers.get(moment(date).format("YYYYMMDD"));
    }, [date, signal])

    useEffect(() => {
        if (!fetchLeaveUsers.loading) return;
        if (fetchLeaveUsers.error) {
            console.error(fetchHoliday.error);
            message.error("Error fetching leave users.");
        } else if (fetchLeaveUsers.response) {
            let data = []
            for (const group in fetchLeaveUsers.response.leave_status) {
                let obj = {}
                obj.group = group
                obj.users = Object.entries(fetchLeaveUsers.response.leave_status[group])
                                    .map(entry => entry[0] + '[' + entry[1].replace(/[01]/g, (m) => ({
                                        '0': '_',
                                        '1': 'X'
                                      }[m])) + ']')
                data.push(obj)
            }
            setLeaveUsers(data)
        }
    }, [fetchLeaveUsers.loading, fetchLeaveUsers.response, fetchLeaveUsers.error])

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
                                            (<Chip label={user} className={classes.chips}/>)
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
