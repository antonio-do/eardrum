import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, DialogTitle, Table, TableRow, TableCell, Chip } from '@material-ui/core';
import { STATUS_TYPES } from '../constants';

export default ({ content, onConfirm, open, setOpen, title }) => {
    let item = JSON.stringify(content) === "{}" ? {} : ({
        'User': content['user'],
        'Half day leave on the first day': content['half'][0] === "0" ? "No" : "Yes",
        'Half day leave on the last day': content['half'][1] === "0" ? "No" : "Yes",
        'Start date': content['startdate'],
        'End date': content['enddate'],
        'Type': <Chip label={content['type']} variant="outlined"/>,
        'Status': <Chip 
                    label={content['status']} 
                    color={content['status'] === STATUS_TYPES.PENDING ? "default" : "primary"}
                    variant={content['status'] === STATUS_TYPES.REJECTED ? "outlined" : "default"}/>,
        'Note': content['note'].split('\n').map(line => <div>{line}</div>),
    })
    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <Table>
                    {/*TODO: use table*/}
                        {Object.entries(item).map(([key, value]) => 
                            <TableRow>
                                <TableCell>
                                    {key}
                                </TableCell>
                                <TableCell>
                                    {value}
                                </TableCell>
                            </TableRow>
                        )}
                    </Table>
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
