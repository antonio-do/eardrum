import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Paper, TextField } from '@material-ui/core'
import React, { Fragment, useEffect, useState } from 'react'
import { KeyboardDatePicker } from "@material-ui/pickers";
import { makeStyles } from '@material-ui/styles';
import { Link, useParams } from 'react-router-dom';
import { useAllUsers, useCurrentUser, useDeleteLeave, useGetLeave, useNewLeave, useUpdateLeave } from './hooks';
import { message, Spin } from 'antd';
import moment from 'moment';

const decodeLeave = (data) => ({
    name: data.user,
    type: data.typ,
    note: "None",
    start_date: moment(data.startdate, "DD/MM/YYYY").toDate(),
    end_date: moment(data.enddate, "DD/MM/YYYY").toDate(),
    is_start_half: data.half === "true",
    is_end_half: data.half === "true",
    status: data.status,
})

const encodeLeave = (data) => ({
    user: data.name,
    typ: data.type,
    startdate: moment(data.start_date).format("DD/MM/YYYY"),
    enddate: moment(data.end_date).format("DD/MM/YYYY"),
    half: data.is_start_half ? "true" : "false",
    status: data.status,
})

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
    const { leaveId } = useParams();
    const isNew = leaveId === 'new';
    const [getLeaveLoading, getLeaveResponse, getLeaveError] = isNew ? [] : useGetLeave(leaveId);
    const isPending = !isNew && !getLeaveLoading && getLeaveResponse  && getLeaveResponse.data.status == "pending";
    const [getUsersLoading, getUsersResponse, getUsersError] = useAllUsers();
    const [types, setTypes] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [getUserLoading, getUserResponse, getUserError] = useCurrentUser();
    const [readOnly, setReadOnly] = useState(false);
    // The field name and type would not render properly if use useState(null) or useState({})
    const [application, setApplication] = useState({
        name: "",
        type: "",
        note: "",
        start_date: new Date(),
        end_date: new Date(),
        is_start_half: false,
        is_end_half: false,
        status: "",
    });
    const [updateLeave, updateLeaveLoading, updateLeaveResponse, updateLeaveError] = isNew 
            ? useNewLeave() 
            : useUpdateLeave(leaveId);
    const [deleteLeave, deleteLeaveLoading, deleteLeaveResponse, deleteLeaveError] = isNew ? [] : useDeleteLeave(leaveId);
    
    const classes = useStyles();

    useEffect(() => {
        if (!getUserResponse && getUserError) {
            console.log(getUserError);
            message.error("Error fetching user information.");
        }
    }, [getUserResponse, getUserError]);

    useEffect(() => {
        if (!getUsersResponse && getUsersError) {
            console.log(getUsersError);
            message.error("Error fetching all users");
        }
    }, [getUsersResponse, getUsersError]);

    if (!isNew) { 
        useEffect(() => {
            if (!getLeaveResponse && getLeaveError) {
                console.log(getLeaveError);
                message.error("Error fetching leave application.");
            } else if (!getLeaveLoading) {
                setApplication(decodeLeave(getLeaveResponse.data));
            }
        }, [getLeaveLoading, getLeaveResponse, getLeaveError]);
    }


    useEffect(() => {
        setTypes(["type 1", "type 2", "type 3", ""]);
        setReadOnly(!isNew);
    }, []);

    const onSubmit = async () => {
        //TODO: fix warning "Can't perform a React state update on unmounted component..."
        await updateLeave(encodeLeave({...application, status: "pending"}));
    }

    const onDelete = async () => {
        //TODO: cancel the application
        await deleteLeave();
    }

    const onApprove = async () => {
        //TODO: delay for several seconds before go back to main page so it can be updated
        await updateLeave(encodeLeave({...application, status: "approved"}));
    }

    const onReject = async () => {
        await updateLeave(encodeLeave({...application, status: "rejected"}));
    }

    if (getUserLoading || getLeaveLoading || getUsersLoading) {
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
                        InputProps={{
                            readOnly: readOnly,
                        }}
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
                        autoOk
                        variant="inline"
                        inputVariant="outlined"
                        label="Start date"
                        format="dd/MM/yyyy"
                        readOnly={ readOnly }
                        InputProps={{ readOnly: readOnly }}
                        value={application.start_date}
                        
                        onChange={(date) => setApplication({...application, start_date: date})}
                        className={classes.dateField}
                    />
                </Grid>
                <Grid item xs={6}>
                    <KeyboardDatePicker
                        autoOk
                        variant="inline"
                        inputVariant="outlined"
                        label="End date"
                        format="dd/MM/yyyy"
                        readOnly={ readOnly }
                        InputProps={{ readOnly: readOnly }}
                        value={application.end_date}
                        onChange={(date) => setApplication({...application, end_date: date})}
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
                                disabled={ readOnly }
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
                                disabled={ readOnly }
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
                        InputProps={{
                            readOnly: readOnly,
                        }}
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
                        InputProps={{
                            readOnly: readOnly,
                        }}
                    />
                </FormControl>
            </Grid>
        </Grid>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            {isNew 
                ?   <Button to='/leave' component={ Link } onClick={ onSubmit } color='primary' variant='contained' className={ classes.button }>
                        Submit
                    </Button>
                :   <Fragment>
                        <Button onClick= { () => setDialogOpen(true) } color='primary' variant='contained' className={ classes.button }>
                            Delete
                        </Button>
                        {getUserResponse.data.is_admin && isPending && (
                            <Fragment>
                                <Button to='/leave' component={ Link } onClick={ onApprove } color='primary' variant='contained' className={ classes.button }>
                                    Approve
                                </Button>
                                <Button to='/leave' component={ Link } onClick={ onReject } color='primary' variant='contained' className={ classes.button }>
                                    Reject
                                </Button>
                            </Fragment>
                        )}
                    </Fragment>
            }
            <Button to='/leave' component={ Link } color='primary' variant='outlined' className={ classes.button }>Back</Button>
        </div>
        <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            aria-describedby="alert-dialog-description"
        >
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                Are you sure you want to cancel this application?
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button to='/leave' component={ Link } onClick={ () => {onDelete(); setDialogOpen(false); }} color="primary" autoFocus>
                Yes
            </Button>
            <Button onClick={() => setDialogOpen(false)} color="primary">
                No
            </Button>
            </DialogActions>
        </Dialog>
    </Paper>
}

export default LeaveDetail;