import React, { useState } from 'react';
import { Dialog, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core';

export default ({ onDelete, open, setOpen }) => (
    <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-describedby="alert-dialog-description"
    >
        <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this application?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={ () => {onDelete(); setOpen(false); }} color="primary" autoFocus>
                    Yes
                </Button>
                <Button onClick={() => setOpen(false)} color="primary">
                    No
                </Button>
        </DialogActions>
    </Dialog> 
)