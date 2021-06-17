import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Paper, TextField } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { KeyboardDatePicker } from "@material-ui/pickers";
import { makeStyles } from '@material-ui/styles';
import { Link, useParams } from 'react-router-dom';
import { useCurrentUser } from './hooks';
import { message, Spin } from 'antd';

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
    const [name, setName] = useState(""); 
    const [names, setNames] = useState([]);
    const [type, setType] = useState("");
    const [types, setTypes] = useState([]);
    const [note, setNote] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isStartHalf, setIsStartHalf] = useState(false);
    const [isEndHalf, setIsEndHalf] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, userData, error] = useCurrentUser();
    const [readOnly, setReadOnly] = useState(false);

    const { leaveId } = useParams();

    const classes = useStyles();

    useEffect(() => {
        if (!userData && error) {
            console.log(error);
            message.error("Error fetching user information.");
        }
    }, [userData, error])

    useEffect(() => {
        getInitialDetails(leaveId);
        getNames();
        getTypes();
        setReadOnly(leaveId !== "new");
    }, []);

    const getInitialDetails = (id) => {
        //TODO: replace mock data
        setName("phong");
        setType("sick");
        setNote("anything");
        setStartDate(new Date());
        setEndDate(new Date());
        setIsStartHalf(true);
        setIsEndHalf(true);
    }

    const getNames = () => {
        //TODO: replace mock data
        setNames(["Alice", "Bob", "Mallory"]);
    }

    const getTypes = () => {
        //TODO: replace mock data
        setTypes(["type 1", "type 2", "type 3"]);
    }

    const onEdit = () => {
        //TODO: edit the application
    }

    const onCancel = () => {
        //TODO: cancel the application
    }

    const onApprove = () => {
        //TODO: approve the application
    }

    const onReject = () => {
        //TODO: reject the application
    }

    if (loading) {
        return <Spin size="large"/>
    }

    return <Paper className={classes.root}>
        <Grid container direction="column" spacing={3}>
            <Grid item xs={12}>
                <FormControl variant="outlined" className={classes.textField}>
                    <TextField
                        label="Name"
                        onChange={ (event) => {setName(event.target.value);} }
                        variant='outlined'
                        margin="normal"
                        value={name}
                        InputProps={{
                            readOnly: readOnly,
                        }}
                        select
                    >
                        {names.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
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
                        value={startDate}
                        onChange={setStartDate}
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
                        value={endDate}
                        onChange={setEndDate}
                        className={classes.dateField}
                    />
                </Grid>
            </Grid>
            <Grid item container spacing={3} xs={12}>
                <Grid item xs={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isStartHalf}
                                onChange={event => setIsStartHalf(event.target.checked)}
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
                                checked={isEndHalf}
                                onChange={event => setIsEndHalf(event.target.checked)}
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
                        onChange={ (event) => {setType(event.target.value);} }
                        variant='outlined'
                        margin="normal"
                        value={ type }
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
                        onChange={ (event) => {setNote(event.target.value);} }
                        variant='outlined'
                        margin="normal"
                        multiline
                        rows={15}
                        rowsMax={15}
                        value={ note }
                        InputProps={{
                            readOnly: readOnly,
                        }}
                    />
                </FormControl>
            </Grid>
        </Grid>

        {userData.data.is_admin 
            ? <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <Button onClick={ onEdit } color='primary' variant='contained' className={ classes.button }>
              Save
          </Button>
          <Button onClick= { () => setDialogOpen(true) } color='primary' variant='contained' className={ classes.button }>
              Cancel Request
          </Button>
          <Button to='/leave' component={ Link } color='primary' variant='outlined' className={ classes.button }>Back</Button>
        </div>
            : <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <Button onClick={ onApprove } color='primary' variant='contained' className={ classes.button }>
              Approve
          </Button>
          <Button onClick= { onReject } color='primary' variant='contained' className={ classes.button }>
              Reject
          </Button>
          <Button to='/leave' component={ Link } color='primary' variant='outlined' className={ classes.button }>Back</Button>
        </div>}

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
            <Button onClick={() => setDialogOpen(false)} color="primary">
                No
            </Button>
            <Button onClick={ () => {onCancel(); setDialogOpen(false); }} color="primary" autoFocus>
                Yes
            </Button>
            </DialogActions>
        </Dialog>
    </Paper>
}

export default LeaveDetail;