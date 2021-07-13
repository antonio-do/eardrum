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
  const [pendingRequests, setPendingRequests] = useState([]);
  const updateLeave = useUpdateLeave();
  const deleteLeave = useDeleteLeave();
  const [leaveId, setLeaveId] = useState(0);
  const leaveContext = useContext(LeaveContext);
  const getLeaveAll = useGetLeaveAll(leaveContext);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState({})
  const [dialogContent, setDialogContent] = useState({})
  const [actionType, setActionType] = useState("")

  useEffect(() => {
    getLeaveAll.execute({status: STATUS_TYPES.PENDING});
  }, [signal])

  useEffect(() => {
    if (!getLeaveAll.data && getLeaveAll.error) {
      console.error(getLeaveAll.error);
      message.error("Error fetching leave requests.");
    }
    if (getLeaveAll.data && !getLeaveAll.loading && !getLeaveAll.error) {
      setPendingRequests(getLeaveAll.data.map(item => ({
        ...item,
        is_half: (item.is_half.replace(/[01]/g, (m) => ({
          '0': '[ False ]',
          '1': '[ True ]'
        }[m])))
      })));
    }
  }, [getLeaveAll.data, getLeaveAll.error, getLeaveAll.loading])

  const APPROVE = "approve";
  const REJECT = "reject";
  const DELETE = "delete";

  const onAction = (item, mode) => {
    setLeaveId(item.id);
    setActionType(mode);
    switch (mode) {
      case APPROVE:
        setOpenApproveDialog(true);
        setDialogTitle("Approve this leave request?")
        setDialogContent(item)
        return;
      case REJECT:
        setOpenRejectDialog(true);
        setDialogTitle("Reject this leave request?")
        setDialogContent(item)
        return;
      case DELETE:
        setOpenDeleteDialog(true);
        setDialogTitle("Delete this leave request?")
        setDialogContent(item)
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
      message.success("Leave request deleted");
    }
  }, [deleteLeave.loading, deleteLeave.data, deleteLeave.error])

  useEffect(() => {
    if (updateLeave.loading) return;
    if (updateLeave.error) {
      message.error("Something went wrong");
      return;
    } else if (updateLeave.data) {
        switch(actionType) {
          case APPROVE:
            message.success("Leave request approved");
            break;
          case REJECT:
            message.success("Leave request rejected");
            break;
        }
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
        && <Button color='primary' style={{margin: 5}} onClick={() => onAction(params.row, APPROVE)}>
          Approve
      </Button>}
      {leaveContext.currentUser.is_admin 
        && <Button color='primary' style={{margin: 5}} onClick={() => onAction(params.row, REJECT)}>
          Reject
      </Button>}
      <Button color='primary' style={{margin: 5}} onClick={() => onAction(params.row, DELETE)}>
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
          content={dialogContent}
          title={dialogTitle}
        /> 
        <ConfirmDialog 
          onConfirm={() => onActionConfirm(leaveId, REJECT)} 
          open={openRejectDialog} 
          setOpen={setOpenRejectDialog}
          content={dialogContent}
          title={dialogTitle}
        /> 
        <ConfirmDialog 
          onConfirm={() => onActionConfirm(leaveId, DELETE)} 
          open={openDeleteDialog} 
          setOpen={setOpenDeleteDialog}
          content={dialogContent}
          title={dialogTitle}
        /> 
    </Box>
  );
}

export default LeavePending;
