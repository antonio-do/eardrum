import { Button, Checkbox, FormControl, FormControlLabel, Grid, MenuItem, Paper, TextField } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { KeyboardDatePicker } from "@material-ui/pickers";
import { makeStyles } from '@material-ui/styles';
import { Link, useHistory } from 'react-router-dom';
import { useAllUsers, useCurrentUser, useNewLeave } from './hooks';
import { message, Spin } from 'antd';
import moment from 'moment';
import { LEAVE_TYPES, STATUS_TYPES } from './constants';

const encodeLeave = (data) => {
    const start = data.is_start_half ? "1" : "0";
    const end = data.is_end_half ? "1" : "0";
    return {
        user: data.name,
        typ: data.type,
        startdate: moment(data.start_date).format("DD/MM/YYYY"),
        enddate: moment(data.end_date).format("DD/MM/YYYY"),
        half: start + end,
        status: data.status,
        note: data.note,
    }
}

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
    const [getUsersLoading, getUsersResponse, getUsersError] = useAllUsers();
    const [types, setTypes] = useState([]);
    const [getUserLoading, getUserResponse, getUserError] = useCurrentUser();
    // The field name and type would not render properly if use useState(null) or useState({})
    const [application, setApplication] = useState({
        name: "",
        type: LEAVE_TYPES[0].label,
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

    useEffect(() => {
        if (!getUserResponse && getUserError) {
            console.log(getUserError);
            message.error("Error fetching user information.");
        } else if (!getUserLoading) {
            setApplication({...application, name: getUserResponse.data.username});
        }
    }, [getUserResponse, getUserLoading, getUserError]);

    useEffect(() => {
        if (!getUsersResponse && getUsersError) {
            console.log(getUsersError);
            message.error("Error fetching all users");
        }
    }, [getUsersResponse, getUsersError]);

    useEffect(() => {
        setTypes(LEAVE_TYPES.map(item => item.label));
    }, []);

    const onSubmit = async () => {
        //TODO: fix warning "Can't perform a React state update on unmounted component..."
        await updateLeave(encodeLeave({...application, status: STATUS_TYPES.PENDING}));
        history.push("/leave");
    }

    const checkDate = (start, end) => moment(end).isSameOrAfter(start) && (moment(end).year() === moment(start).year());

    if (getUserLoading || getUsersLoading) {
        return <Spin size="large"/>
    }

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
                        {getUsersResponse.data.users.map((item) => (
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
                        helperText={errorDate && "End date must be in the same year and no sooner than start date."}
                        autoOk
                        variant="inline"
                        inputVariant="outlined"
                        label="Start date"
                        format="dd/MM/yyyy"
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
                        helperText={errorDate && "End date must be in the same year and no sooner than start date."}
                        autoOk
                        variant="inline"
                        inputVariant="outlined"
                        label="End date"
                        format="dd/MM/yyyy"
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
                        {types.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
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