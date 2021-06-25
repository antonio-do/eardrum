import React, { useState } from 'react';
import { Dialog, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core';

export default ({ content, onConfirm, open, setOpen }) => (
    <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-describedby="alert-dialog-description"
    >
        <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {content}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={ () => {onConfirm(); setOpen(false); }} color="primary" autoFocus>
                    Yes
                </Button>
                <Button onClick={() => setOpen(false)} color="primary">
                    No
                </Button>
        </DialogActions>
    </Dialog> 
)