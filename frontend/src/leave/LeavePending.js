import React, { useEffect, useState, Fragment, useContext } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Button, Typography, Chip } from '@material-ui/core';
import { useDeleteLeave, useGetLeaveAll, useUpdateLeave, LeaveContext  } from './hooks';
import { message, Spin } from 'antd';
import CustomPopover from './components/CustomPopover.js';
import ConfirmDialog from './components/ConfirmDialog';
import { DATE_FORMAT, STATUS_TYPES } from './constants';
import moment from "moment"

const LeavePending = ({reload, signal}) => {
  const [pendingRequests, setPendingApplications] = useState([]);
  const updateLeave = useUpdateLeave();
  const deleteLeave = useDeleteLeave();
  const [leaveId, setLeaveId] = useState(0);
  const leaveContext = useContext(LeaveContext);
  const getLeaveAll = useGetLeaveAll(leaveContext);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  useEffect(() => {
    getLeaveAll.execute({status: STATUS_TYPES.PENDING});
  }, [signal])

  useEffect(() => {
    if (!getLeaveAll.data && getLeaveAll.error) {
      console.error(getLeaveAll.error);
      message.error("Error fetching leave applications.");
    }
    if (getLeaveAll.data && !getLeaveAll.loading && !getLeaveAll.error) {
      setPendingApplications(getLeaveAll.data);
    }
  }, [getLeaveAll.data, getLeaveAll.error, getLeaveAll.loading])

  const APPROVE = "approve";
  const REJECT = "reject";
  const DELETE = "delete";

  const onAction = (id, mode) => {
    setLeaveId(id);
    switch (mode) {
      case APPROVE:
        setOpenApproveDialog(true);
        return;
      case REJECT:
        setOpenRejectDialog(true);
        return;
      case DELETE:
        setOpenDeleteDialog(true);
        return;
    }
  }

  const onActionConfirm = async (id, mode) => {
    switch (mode) {
      case APPROVE:
        await updateLeave.execute({id: id, data: {status: STATUS_TYPES.APPROVED}});
        break;
      case REJECT:
        await updateLeave.execute({id: id, data: {status: STATUS_TYPES.REJECTED}});
        break;
      case DELETE:
        await deleteLeave.execute({id: id});
        break;
    }
    reload();
  }

  useEffect(() => {
    if (deleteLeave.loading) return;
    if (deleteLeave.error) {
      message.error("Something went wrong");
      return;
    } else if (deleteLeave.data) {
      message.success("Action successfully performed");
    }
  }, [deleteLeave.loading, deleteLeave.data, deleteLeave.error])

  useEffect(() => {
    if (updateLeave.loading) return;
    if (updateLeave.error) {
      message.error("Something went wrong");
      return;
    } else if (updateLeave.data) {
      message.success("Action successfully performed");
    }
  }, [updateLeave.loading, updateLeave.data, updateLeave.error])

  const renderNoteCell = (params) => (
    params.row.note === "" 
      ? <div style={{padding:10}}>-</div> 
      : <CustomPopover label="View" text={params.row.note}/>
  )

  const renderActionButtons = (params) => (
    <Fragment>
      {leaveContext.currentUser.is_admin 
        && <Button color='primary' style={{margin: 5}} onClick={() => onAction(params.id, APPROVE)}>
          Approve
      </Button>}
      {leaveContext.currentUser.is_admin 
        && <Button color='primary' style={{margin: 5}} onClick={() => onAction(params.id, REJECT)}>
          Reject
      </Button>}
      <Button color='primary' style={{margin: 5}} onClick={() => onAction(params.id, DELETE)}>
          Delete
      </Button>
    </Fragment>
  )

  const renderStatusCell = (params) => (
    <Chip label={params.value}/>
  )

  const renderTypeCell = (params) => (
    <Chip label={params.value} variant="outlined"/>
  )

  const columns = [
    { field: 'user', headerName: 'User', type: 'string', flex: 1, },
    { field: 'start_date', headerName: 'Start date', type: 'string', flex: 1, },
    { field: 'end_date', headerName: 'End date', type: 'string', flex: 1, },
    { field: 'type', headerName: 'Type', type: 'string', flex: 1, sortable: false, renderCell: renderTypeCell, },
    { field: 'is_half', headerName: 'Half-day leave', type: 'string', flex: 1, 
      description: "Whether the leave request apply for half-day leave on the first and last day, respectively", sortable: false, },
    { field: 'note', headerName: 'Note', type: 'string', flex: 1,
      renderCell: renderNoteCell, sortable: false, },
    { field: 'status', headerName: 'Status', type: 'string', flex: 1, sortable: false, 
      renderCell: renderStatusCell, },
    { field: 'action', headerName: 'Action', disableColumnMenu: true, sortable: false, 
      renderCell: renderActionButtons , width: (leaveContext.currentUser.is_admin) * 200 + 100},
  ];

  return (
    <Box m={2}>
        <Typography variant="h5" gutterBottom>Pending requests</Typography>
        {(getLeaveAll.loading) ? <Spin size="small"/> : <DataGrid
            autoHeight 
            rows={pendingRequests} 
            columns={columns}
            pagination
            pageSize={10}
            disableSelectionOnClick 
        />}
        <ConfirmDialog 
          onConfirm={() => onActionConfirm(leaveId, APPROVE)} 
          open={openApproveDialog} 
          setOpen={setOpenApproveDialog}
          content="Are you sure you want to approve this application?"
        /> 
        <ConfirmDialog 
          onConfirm={() => onActionConfirm(leaveId, REJECT)} 
          open={openRejectDialog} 
          setOpen={setOpenRejectDialog}
          content="Are you sure you want to reject this application?"
        /> 
        <ConfirmDialog 
          onConfirm={() => onActionConfirm(leaveId, DELETE)} 
          open={openDeleteDialog} 
          setOpen={setOpenDeleteDialog}
          content="Are you sure you want to delete this application?"
        /> 
    </Box>
  );
}

export default LeavePending;
