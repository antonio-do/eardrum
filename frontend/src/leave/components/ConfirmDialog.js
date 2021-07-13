import React, { useState } from 'react';
import { Dialog, DialogContent, DialogContentText, DialogActions, Button, DialogTitle } from '@material-ui/core';

export default ({ content, onConfirm, open, setOpen, title }) => {
    let item = {}
    Object.entries(content).map(([key, value]) => {
        if (key == 'id' || key == 'note') return;
        if (key == 'is_half') {
            item['Half day leave on the first day'] = value[0] == 0 ? "No" : "Yes"
            item['Half day leave on the last day'] = value[1] == 0 ? "No" : "Yes"
        }
        else {
            let capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            item[capitalizedKey.replace('_', ' ')] = value;
        }
    })
    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    {Object.entries(item).map(([key, value]) => 
                        (<DialogContentText id="alert-dialog-description">
                            {key}: {value}
                        </DialogContentText>)
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={ () => {onConfirm(); setOpen(false); }} color="primary">
                        Yes
                    </Button>
                    <Button onClick={() => setOpen(false)} color="primary" autoFocus>
                        No
                    </Button>
            </DialogActions>
        </Dialog> 
)}
