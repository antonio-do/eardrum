import { Button, Checkbox, FormControl, FormControlLabel, Grid, MenuItem, Paper, TextField } from '@material-ui/core'
import React, { useContext, useState } from 'react'
import { KeyboardDatePicker } from "@material-ui/pickers";
import { makeStyles } from '@material-ui/styles';
import { Link, useHistory } from 'react-router-dom';
import { LeaveContext, useNewLeave } from './hooks';
import moment from 'moment';
import { DATE_FORMAT, STATUS_TYPES } from './constants';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '30px',
    },
    textField: {
        width: '100%',
        height: '100%',
    },
    dateField: {
        width: '100%', 
        height: '100%', 
    },
    button: {
        marginRight: '5px',
    },
}));

const LeaveDetail = () => {
    const leaveContext = useContext(LeaveContext);
    
    // The field name and type would not render properly if use useState(null) or useState({})
    const [application, setApplication] = useState({
        name: leaveContext.currentUser.username,
        type: leaveContext.leaveTypes[0].name,
        note: "",
        start_date: new Date(),
        end_date: new Date(),
        is_start_half: false,
        is_end_half: false,
        status: "",
    });
    const [updateLeave, updateLeaveLoading, updateLeaveResponse, updateLeaveError] = useNewLeave() 
    const [errorDate, setErrorDate] = useState(false);
    
    let history = useHistory();
    const classes = useStyles();

    const onSubmit = async () => {
        await updateLeave({
            user: application.name,
            typ: application.type,
            startdate: moment(application.start_date).format(DATE_FORMAT.VALUE),
            enddate: moment(application.end_date).format(DATE_FORMAT.VALUE),
            half: (application.is_start_half ? "1" : "0") + (application.is_end_half ? "1" : "0"),
            status: STATUS_TYPES.PENDING,
            note: application.note,
        })
        history.push("/leave");
    }

    // check if start and end are same year and start is no later than year
    const checkDate = (start, end) => moment(end).isSameOrAfter(start) 
                                    && (moment(end).year() === moment(start).year());

    return <Paper className={classes.root}>
        <Grid container direction="column" spacing={3}>
            <Grid item xs={12}>
                <FormControl variant="outlined" className={classes.textField}>
                    <TextField
                        label="Name"
                        onChange={ (event) => {setApplication({...application, name: event.target.value});} }
                        variant='outlined'
                        margin="normal"
                        value={application.name}
                        select
                    >
                        {leaveContext.allUsers.map((item) => (
                            <MenuItem key={item.username} value={item.username}>
                                {item.username}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>
            </Grid>
            <Grid item container spacing={3} xs={12}>
                <Grid item xs={6}>
                    <KeyboardDatePicker
                        error={errorDate}
                        helperText={errorDate 
                            && "End date must be in the same year and no sooner than start date."}
                        autoOk
                        variant="inline"
                        inputVariant="outlined"
                        label="Start date"
                        format={DATE_FORMAT.LABEL_DATEFNS}
                        value={application.start_date}
                        onChange={(date) => {
                            setApplication({...application, start_date: date}); 
                            setErrorDate(!checkDate(date, application.end_date));
                        }}
                        className={classes.dateField}
                    />
                </Grid>
                <Grid item xs={6}>
                    <KeyboardDatePicker
                        error={errorDate}
                        helperText={errorDate 
                            && "End date must be in the same year and no sooner than start date."}
                        autoOk
                        variant="inline"
                        inputVariant="outlined"
                        label="End date"
                        format={DATE_FORMAT.LABEL_DATEFNS}
                        value={application.end_date}
                        onChange={(date) => {
                            setApplication({...application, end_date: date}); 
                            setErrorDate(!checkDate(application.start_date, date));
                        }}
                        className={classes.dateField}
                    />
                </Grid>
            </Grid>
            <Grid item container spacing={3} xs={12}>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={application.is_start_half}
                                onChange={event => setApplication({...application, is_start_half: event.target.checked})}
                                name="isStartHalf"
                                color="primary"
                            />
                        }
                        label="Take a half day off at the beginning of leave"
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={application.is_end_half}
                                onChange={event => setApplication({...application, is_end_half: event.target.checked})}
                                name="isEndHalf"
                                color="primary"
                            />
                        }
                        label="Take a half day off at the end of leave"
                    />
                </Grid>
            </Grid>
            <Grid item>
                <FormControl variant="outlined" className={classes.textField}>
                    <TextField
                        label="Type"
                        onChange={ (event) => setApplication({...application, type: event.target.value}) }
                        variant='outlined'
                        margin="normal"
                        value={ application.type }
                        select
                    >
                        {leaveContext.leaveTypes.map((type) => (
                            <MenuItem key={type.name} value={type.name}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>
            </Grid>
            <Grid item>
                <FormControl variant="outlined" className={classes.textField}>
                    <TextField
                        label="Note"
                        onChange={ (event) => setApplication({...application, note: event.target.value}) }
                        placeholder=" "
                        variant='outlined'
                        margin="normal"
                        multiline
                        rows={15}
                        rowsMax={15}
                        value={ application.note || " " }
                    />
                </FormControl>
            </Grid>
        </Grid>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button onClick={ onSubmit } color='primary' variant='contained' className={ classes.button } disabled={errorDate}>
                Submit
            </Button>
            <Button to='/leave' component={ Link } color='primary' variant='outlined' className={ classes.button }>Back</Button>
        </div>
    </Paper>
}

export default LeaveDetail;