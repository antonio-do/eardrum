import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, FormControlLabel, Grid, InputLabel, Paper, TextField } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { KeyboardDatePicker } from "@material-ui/pickers";
import { makeStyles } from '@material-ui/styles';
import { Link, useParams } from 'react-router-dom';

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

const LeaveDetail = (props) => {
    const [name, setName] = useState(""); 
    const [type, setType] = useState("");
    const [note, setNote] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isStartHalf, setIsStartHalf] = useState(false);
    const [isEndHalf, setIsEndHalf] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const { leaveId } = useParams();

    const classes = useStyles();

    useEffect(() => {
        getDetails(leaveId);
        setIsAdmin(true);
    }, []);

    const getDetails = (id) => {
        //TODO: replace mock data
        setName("phong");
        setType("sick");
        setNote("anything");
        setStartDate(new Date());
        setEndDate(new Date());
        setIsStartHalf(true);
        setIsEndHalf(true);
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
                            readOnly: isAdmin,
                        }}
                    />
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
                        readOnly={ isAdmin }
                        InputProps={{ readOnly: isAdmin }}
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
                        readOnly={ isAdmin }
                        InputProps={{ readOnly: isAdmin }}
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
                                disabled={ isAdmin }
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
                                disabled={ isAdmin }
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
                            readOnly: isAdmin,
                        }}
                    />
                </FormControl>
                </Grid>
            <Grid item>
                <FormControl variant="outlined" className={classes.textField}>
                    <TextField
                        label="Note"
                        onChange={ (event) => {setNote(event.target.value);} }
                        variant='outlined'
                        margin="normal"
                        value={ note }
                        InputProps={{
                            readOnly: isAdmin,
                        }}
                    />
                </FormControl>
            </Grid>
        </Grid>

        {!isAdmin && <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <Button onClick={ onEdit } color='primary' variant='contained' className={ classes.button }>
              Save
          </Button>
          <Button onClick= { () => setDialogOpen(true) } color='primary' variant='contained' className={ classes.button }>
              Cancel Request
          </Button>
          <Button to='/leave' component={ Link } color='primary' variant='outlined' className={ classes.button }>Back</Button>
        </div>}

        {isAdmin && <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
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