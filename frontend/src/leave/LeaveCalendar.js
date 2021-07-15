import React, { Fragment, useEffect, useState } from "react";
import { DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { 
    Box,
    Button,
    Card, 
    CardContent, 
    Chip, 
    Divider, 
    Grid, 
    List, 
    ListItem, 
    ListItemSecondaryAction, 
    ListItemText, 
    ListSubheader, 
    makeStyles, 
    Paper, 
    TextField, 
    Tooltip,
    Typography,
} from "@material-ui/core";
import { useAddHoliday, useDeleteHoliday, useHolidays, useLeaveUsers } from "./hooks";
import { message } from "antd";
import moment from "moment";
import { DATE_FORMAT } from "./constants";
import { handleError } from "./helpers";

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

const StaticDatePicker = ({signal, reload}) => {
    const [date, setDate] = useState(new Date());
    const [year, setYear] = useState(new Date().getFullYear());
    const fetchHoliday = useHolidays();
    const fetchLeaveUsers = useLeaveUsers();

    const [isEditHoliday, setIsEditHoliday] = useState(false);
    const deleteHoliday = useDeleteHoliday();
    const addHoliday = useAddHoliday();
    const [holiday, setHoliday] = useState(null)

    const classes = useStyles();

    useEffect(() => {
        const fetchApi = async () => {
            await fetchLeaveUsers.execute({date: moment(date).format("YYYYMMDD")})
            handleError(fetchLeaveUsers, "Error fetching leave users.");
        }
        fetchApi();
    }, [date, signal])

    useEffect(() => {
        const fetchApi = async () => {
            await fetchHoliday.execute({year: year});
            handleError(fetchHoliday, "Error fetching holidays.");
        }
        fetchApi();
    }, [year])

    const onDeleteHoliday = async (holiday) => {
        await deleteHoliday.execute({date: holiday})
        handleError(deleteHoliday, "Error deleting holiday.");
        if (!deleteHoliday.error) {
            fetchHoliday.execute({year: year})
            handleError(deleteHoliday, "Error fetching holidays");
        }
    }

    const onAddHoliday = async (holiday) => {
        await addHoliday.execute({date: holiday})
        handleError(addHoliday, "Error adding holiday.");
        if (!addHoliday.error) {
            fetchHoliday.execute({year: year})
            handleError(fetchHoliday, "Error fetching holidays.");
        }
    }

    // render holidays differently
    const renderDay = (day, selectedDate, dayInCurrentMonth, dayComponent) => { 
        const isHoliday = (day) => {
            return fetchHoliday.data.find(item => {return item.date.getTime() === day.getTime()});
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
            <ListSubheader className={classes.list}>Users on leave ({moment(date).format("DD/MM/YYYY")})</ListSubheader>
            <Paper style={{overflow: 'auto'}}>
                <List>
                    {fetchLeaveUsers.data.map(item => (
                        <Fragment>
                            <Card style={{display: 'flex', flexWrap: 'wrap'}}>
                                <CardContent style={{padding: 5}}>
                                    <Fragment>
                                        <Typography variant="h6" className={classes.chips}>{item.group}</Typography>
                                        {item.users.map(user => 
                                            ((user.status !== '') && <Tooltip title={user.status} >
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
            <ListSubheader className={classes.list}>
                Holidays
                <ListItemSecondaryAction>
                    <Button variant="contained" onClick={() => {
                        if (isEditHoliday) {
                            reload();
                        }
                        setIsEditHoliday(edit => !edit)
                    }}>
                        {isEditHoliday ? "Done" : "Edit"}
                    </Button>
                </ListItemSecondaryAction>
            </ListSubheader>
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
                    {isEditHoliday && <Box ml={1}>
                        <Grid container direction="row" alignItems="center">
                            <Grid item xs={8}>
                            <DatePicker
                                disableToolbar
                                autoOk
                                label="Add holiday"
                                variant="inline"
                                inputVariant="outlined"
                                format={DATE_FORMAT.LABEL_DATEFNS}
                                value={holiday}
                                onChange={(date) => setHoliday(date)}
                            />
                            </Grid>
                            <Grid item container direction="column" xs={4}>
                                <Button onClick={() => { 
                                    if (holiday === null) return;
                                    setHoliday(null); 
                                    onAddHoliday(moment(holiday).format(DATE_FORMAT.VALUE))
                                }}>Add</Button>
                                <Button onClick={() => setHoliday(null)}>Clear</Button>
                            </Grid>
                        </Grid>
                    </Box>}
                    <Divider/>
                    {fetchHoliday.data.map(item => 
                        (<Fragment>
                            <ListItem>
                                <ListItemText 
                                    primary={moment(item.date).format(DATE_FORMAT.LABEL)} 
                                    secondary={
                                        moment(item.date).diff(moment().startOf('day'), 'days') < 0 
                                            ? "Passed"
                                            : `${moment(item.date).diff(moment().startOf('day'), 'days')} day(s) left`
                                    } />
                                {isEditHoliday && <ListItemSecondaryAction>
                                    <Button 
                                        onClick={() => {
                                            onDeleteHoliday(moment(item.date).format(DATE_FORMAT.VALUE))
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </ListItemSecondaryAction>}
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
