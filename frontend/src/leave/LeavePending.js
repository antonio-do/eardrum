import React, { useEffect, useState, Fragment, useContext } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Button, Typography } from '@material-ui/core';
import { useDeleteLeave, useGetLeaveAll, useUpdateLeave, LeaveContext  } from './hooks';
import { message, Spin } from 'antd';
import CustomPopover from './components/CustomPopover.js';
import ConfirmDialog from './components/ConfirmDialog';
import { DATE_FORMAT, STATUS_TYPES } from './constants';
import moment from "moment"

const LeavePending = ({reload}) => {
  const [pendingRequests, setPendingApplications] = useState([]);
  const [getAll, getAllLoading, getAllResponse, getAllError] = useGetLeaveAll();
  const [update, loadingUpdate, responseUpdate, errorUpdate] = useUpdateLeave();
  const [deleteLeave, deleteLoading, deleteResponse, deleteUpdate] = useDeleteLeave();
  const [leaveId, setLeaveId] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const leaveContext = useContext(LeaveContext);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  useEffect(() => {
    getAll();
    setIsAdmin(leaveContext.currentUser.is_admin);
  }, [])

  useEffect(() => {
    if (!getAllResponse && getAllError) {
      console.log(getAllError);
      message.error("Error fetching leave applications.");
    }
    if (getAllResponse && !getAllLoading && !getAllError) {
      getRequests();
    }
  }, [getAllResponse, getAllError, getAllLoading])

  const getRequests = () => {
    const data = getAllResponse.data.map(item => ({
      id: item.id,
      user: item.user,
      start_date: moment(item.startdate, DATE_FORMAT.VALUE).format(DATE_FORMAT.LABEL),
      end_date: moment(item.enddate, DATE_FORMAT.VALUE).format(DATE_FORMAT.LABEL),
      type: item.typ,
      is_half_beginning: (item.half & "10") === 10,
      is_half_end: (item.half & "01") === 1,
      status: item.status,
      note: item.note,
    }))
    setPendingApplications(data.filter(item => item.status === "pending"));
  }

  //TODO: force reload after performing actions

  const onApprove = (id) => {
    setLeaveId(id);
    setOpenApproveDialog(true);
  }

  const onApproveConfirm =  async (id) => {
      await update(id, {status: STATUS_TYPES.APPROVED});
      await getAll();
      getRequests()
      reload();
  }

  const onReject = (id) => {
    setLeaveId(id);
    setOpenRejectDialog(true);
  }

  const onRejectConfirm = async (id) => {
      await update(id, {status: STATUS_TYPES.REJECTED});
      await getAll();
      getRequests()
      reload();
  }

  const onDelete = (id) => {
    setLeaveId(id);
    setOpenDeleteDialog(true);
  }

  const onDeleteConfirm = async (id) => {
      await deleteLeave(id);
      await getAll();
      getRequests()
      reload();
  }

  const columns = [
    { field: 'user', headerName: 'User', type: 'string', flex: 1, },
    { field: 'start_date', headerName: 'Start date', type: 'string', flex: 1, },
    { field: 'end_date', headerName: 'End date', type: 'string', flex: 1, },
    { field: 'type', headerName: 'Type', type: 'string', flex: 1, },
    { field: 'is_half_beginning', headerName: 'Half-day start', type: 'boolean', flex: 1, 
    description: "Take a half day at the beginning of leave", },
    { field: 'is_half_end', headerName: 'Half-day end', type: 'boolean', flex: 1, 
    description: "Take a half day at the end of leave ", },
    { field: 'note', headerName: 'Note', type: 'string', flex: 1,
    renderCell: (params) => (
      params.row.note === "" ? <div style={{padding:10}}>-</div> : 
      <CustomPopover label="View" text={params.row.note}/>
    ) },
    { field: 'status', headerName: 'Status', type: 'string', flex: 1, },
    { field: 'details', headerName: 'Action', disableColumnMenu: true, sortable: false, 
    renderCell: (params) => (
      <Fragment>
        {isAdmin && <Button color='primary' style={{margin: 5}} onClick={() => onApprove(params.id)}>
            Approve
        </Button>}
        {isAdmin && <Button color='primary' style={{margin: 5}} onClick={() => onReject(params.id)}>
            Reject
        </Button>}
        <Button color='primary' style={{margin: 5}} onClick={() => (onDelete(params.id))}>
            Delete
        </Button>
      </Fragment>
    ), width: (isAdmin) * 200 + 100},
  ];

  return (
    <Box m={2}>
        <Typography variant="h5" gutterBottom>Pending requests</Typography>
        {(getAllLoading) ? <Spin size="small"/> : <DataGrid
            autoHeight 
            rows={pendingRequests} 
            columns={columns}
            pagination
            pageSize={10}
            disableSelectionOnClick 
        />}
        <ConfirmDialog 
          onConfirm={() => onApproveConfirm(leaveId)} 
          open={openApproveDialog} 
          setOpen={setOpenApproveDialog}
          content="Are you sure you want to approve this application?"
        /> 
        <ConfirmDialog 
          onConfirm={() => onRejectConfirm(leaveId)} 
          open={openRejectDialog} 
          setOpen={setOpenRejectDialog}
          content="Are you sure you want to reject this application?"
        /> 
        <ConfirmDialog 
          onConfirm={() => onDeleteConfirm(leaveId)} 
          open={openDeleteDialog} 
          setOpen={setOpenDeleteDialog}
          content="Are you sure you want to delete this application?"
        /> 
    </Box>
  );
}

export default LeavePending;
