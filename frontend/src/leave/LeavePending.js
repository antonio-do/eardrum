import React, { useEffect, useState, Fragment } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Button, Typography, Dialog, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { useDeleteLeave2, useGetLeaveAll2, useUpdateLeave2, useCurrentUser  } from './hooks';
import { message, Spin } from 'antd';
import SimpleMenu from './components/Menu';
import CustomPopover from './components/CustomPopover.js';
import DeleteDialog from './components/DeleteDialog';

const LeavePending = ({reload}) => {
  const [pendingRequests, setPendingApplications] = useState([]);
  const [getAll, getAllLoading, getAllResponse, getAllError] = useGetLeaveAll2();
  const [update, loadingUpdate, responseUpdate, errorUpdate] = useUpdateLeave2();
  const [deleteLeave, deleteLoading, deleteResponse, deleteUpdate] = useDeleteLeave2();
  const [getUserLoading, getUserResponse, getUserError] = useCurrentUser();
  const [openDialog, setOpenDialog] = useState(false);
  const [leaveId, setLeaveId] = useState(0);

  useEffect(() => {
    if (!getUserResponse && getUserError) {
        console.log(getUserError);
        message.error("Error fetching user information.");
    }
  }, [getUserResponse, getUserLoading, getUserError]);

  useEffect(() => {
    getAll();
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
      start_date: item.startdate,
      end_date: item.enddate,
      type: item.typ,
      is_half_beginning: (item.half & "10") === 10,
      is_half_end: (item.half & "01") === 1,
      status: item.status,
      note: item.note,
    }))
    setPendingApplications(data.filter(item => item.status === "pending"));
  }

  //TODO: force reload after performing actions

  const onApprove =  async (id) => {
      await update(id, {status: "approve"});
      await getAll();
      getRequests()
      reload();
  }

  const onReject = async (id) => {
      await update(id, {status: "reject"});
      await getAll();
      getRequests()
      reload();
  }

  const onDelete = (id) => {
    setLeaveId(id);
    setOpenDialog(true);
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
        {getUserResponse && getUserResponse.data.is_admin && <Button color='primary' style={{margin: 5}} onClick={() => onApprove(params.id)}>
            Approve
        </Button>}
        {getUserResponse && getUserResponse.data.is_admin && <Button color='primary' style={{margin: 5}} onClick={() => onReject(params.id)}>
            Reject
        </Button>}
        <Button color='primary' style={{margin: 5}} onClick={() => (onDelete(params.id))}>
            Delete
        </Button>
      </Fragment>
    ), width: (getUserResponse && getUserResponse.data.is_admin) * 200 + 100},
  ];

  return (
    <Box mt={5}>
        <Typography variant="h5" gutterBottom>Pending requests</Typography>
        {(getUserLoading || getAllLoading) ? <Spin size="small"/> : <DataGrid
            autoHeight 
            rows={pendingRequests} 
            columns={columns}
            pagination
            pageSize={10}
            disableSelectionOnClick 
        />}
        <DeleteDialog onDelete={() => onDeleteConfirm(leaveId)} open={openDialog} setOpen={setOpenDialog}/> 
    </Box>
  );
}

export default LeavePending;
