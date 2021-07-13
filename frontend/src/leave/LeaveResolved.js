import React, { useContext, useEffect, useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Typography, Button, Chip } from '@material-ui/core';
import { LeaveContext, useGetLeaveAll, useDeleteLeave  } from './hooks';
import { message, Spin } from 'antd';
import moment from 'moment';
import CustomPopover from './components/CustomPopover.js';
import ConfirmDialog from './components/ConfirmDialog';
import { DATE_FORMAT, STATUS_TYPES } from './constants';

const LeaveResolved = ({year, signal, reload}) => {
  const [resolvedRequests, setResolvedRequests] = useState([]);
  const deleteLeave = useDeleteLeave();
  const [leaveId, setLeaveId] = useState(0);
  const leaveContext = useContext(LeaveContext);
  const getLeaveAll = useGetLeaveAll(leaveContext);
  const [dialogContent, setDialogContent] = useState({})
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    getLeaveAll.execute({year: year});
  }, [signal, year])

  useEffect(() => {
    if (!getLeaveAll.data && getLeaveAll.error) {
      console.error(getLeaveAll.error);
      message.error("Error fetching leave requests.");
    }
    if (getLeaveAll.data && !getLeaveAll.loading && !getLeaveAll.error) {
      setResolvedRequests(getLeaveAll.data.filter(item => item.status !== "pending").map(item => ({
        ...item,
        is_half: (item.is_half.replace(/[01]/g, (m) => ({
          '0': '[ False ]',
          '1': '[ True ]'
        }[m])))
      })));
    }
  }, [getLeaveAll.data, getLeaveAll.error, getLeaveAll.loading])

  const onDelete = (item) => {
    setLeaveId(item.id);
    setDialogContent(item)
    setOpenDeleteDialog(true);
  }

  const onDeleteConfirm = async (id) => {
    await deleteLeave.execute({id: id});
    reload();
  }

  useEffect(() => {
    if (deleteLeave.loading) return;
    if (deleteLeave.error) {
      message.error("Something went wrong");
      return;
    } else if (deleteLeave.data) {
      message.success("Leave request deleted");
    }
  }, [deleteLeave.loading, deleteLeave.data, deleteLeave.error])

  const renderActionButton = (params) => (
    <Button color='primary' style={{margin: 5}} onClick={() => onDelete(params.row)}>
        Delete
    </Button>
  )

  const renderNoteCell = (params) => (
    params.row.note === "" ? <div style={{padding:10}}>-</div> : 
    <CustomPopover label="View" text={params.row.note}/>
  )

  const renderStatusCell = (params) => (
    <Chip 
      label={params.value} 
      color="primary"
      variant={params.value == STATUS_TYPES.REJECTED ? "outlined" : "default"}/>
  )

  const renderTypeCell = (params) => (
    <Chip label={params.value} variant="outlined"/>
  )

  const columns = [
    { field: 'user', headerName: 'User', type: 'string', flex: 1, },
    { field: 'start_date', headerName: 'Start date', type: 'string', flex: 1, },
    { field: 'end_date', headerName: 'End date', type: 'string', flex: 1, },
    { field: 'type', headerName: 'Type', type: 'string', flex: 1, sortable: false, renderCell: renderTypeCell },
    { field: 'is_half', headerName: 'Half-day leave', type: 'string', flex: 1, 
      description: "Whether the leave request apply for half-day leave on the first and last day, respectively", sortable: false, },
    { field: 'note', headerName: 'Note', type: 'string', flex: 1,
    renderCell: renderNoteCell, sortable: false },
    { field: 'status', headerName: 'Status', type: 'string', flex: 1, sortable: false, renderCell: renderStatusCell },
    { field: 'action', headerName: 'Action', disableColumnMenu: true, sortable: false, 
      renderCell: renderActionButton , width: 100, hide: !leaveContext.currentUser.is_admin, },
  ];

  return (
    <Box m={2}>
        <Typography variant="h5" gutterBottom>Resolved requests (year {year})</Typography>
        {(getLeaveAll.loading) ? <Spin size="small"/> : <DataGrid
            autoHeight 
            rows={resolvedRequests} 
            columns={columns}
            pagination
            pageSize={10}
            disableSelectionOnClick 
        />}
        <ConfirmDialog 
          onConfirm={() => onDeleteConfirm(leaveId)} 
          open={openDeleteDialog} 
          setOpen={setOpenDeleteDialog}
          title="Delete this leave request?"
          content={dialogContent}
        /> 
    </Box>
  );
}

export default LeaveResolved;
