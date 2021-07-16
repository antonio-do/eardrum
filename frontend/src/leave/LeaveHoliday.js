import React, { Fragment, useEffect, useState } from "react";
import { DatePicker } from "@material-ui/pickers";
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
    LinearProgress, 
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
import { useAddHoliday, useDeleteHoliday, useHolidays, useLeaveUsers, useRecalculateMasks } from "./hooks";
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
    }
}))

const LeaveHoliday = ({signal, reload}) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const fetchHoliday = useHolidays();
    const [isEditHoliday, setIsEditHoliday] = useState(false);
    const deleteHoliday = useDeleteHoliday();
    const addHoliday = useAddHoliday();
    const [holiday, setHoliday] = useState(null);
    const recalculateMasks = useRecalculateMasks();

    const classes = useStyles();

    useEffect(() => {
        const fetchApi = async () => {
            await fetchHoliday.execute({year: year});
            handleError(fetchHoliday, "Error fetching holidays.");
        }
        fetchApi();
    }, [year])

    const handleDeleteHoliday = async (holiday) => {
        await deleteHoliday.execute({date: holiday})
        handleError(deleteHoliday, "Error deleting holiday.");
        if (!deleteHoliday.error) {
            await fetchHoliday.execute({year: year})
            handleError(deleteHoliday, "Error fetching holidays");
        }
    }

    const handleAddHoliday = async (holiday) => {
        await addHoliday.execute({date: holiday})
        handleError(addHoliday, "Error adding holiday.");
        if (!addHoliday.error) {
            await fetchHoliday.execute({year: year})
            handleError(fetchHoliday, "Error fetching holidays.");
        }
    }

    const onDoneEdit = async () => {
        if (isEditHoliday) {
            await recalculateMasks.execute({year: year});
            handleError(recalculateMasks, "Error updating statistics", "Statistics updated");
            reload();
        }
        setIsEditHoliday(edit => !edit)
    }

    return (
        <Paper className={classes.root}>
            <ListSubheader className={classes.list}>
                Holidays
                <ListItemSecondaryAction>
                    <Button variant="contained" onClick={onDoneEdit}>
                        {isEditHoliday ? "Done" : "Edit"}
                    </Button>
                </ListItemSecondaryAction>
            </ListSubheader>
            {fetchHoliday.loading && <LinearProgress/>}
            <Paper>
                <div className={classes.yearInput}>
                    <TextField 
                        label="Year" 
                        type="number" 
                        disabled={isEditHoliday}
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
                                minDate={new Date(Number(year), 0, 1)}
                                maxDate={new Date(Number(year), 11, 31)}
                            />
                            </Grid>
                            <Grid item container direction="column" xs={4}>
                                <Button onClick={() => { 
                                    if (holiday === null) return;
                                    setHoliday(null); 
                                    handleAddHoliday(moment(holiday).format(DATE_FORMAT.VALUE))
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
                                            handleDeleteHoliday(moment(item.date).format(DATE_FORMAT.VALUE))
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

export default LeaveHoliday;
