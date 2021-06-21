import React, { useEffect, useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Typography } from '@material-ui/core';
import { useDeleteLeave2, useGetLeaveAll2, useUpdateLeave2, useCurrentUser  } from './hooks';
import { message, Spin } from 'antd';
import SimpleMenu from './components/Menu';
import CustomPopover from './components/CustomPopover.js';

const LeavePending = ({reload}) => {
  const [pendingRequests, setPendingApplications] = useState([]);
  const [getAll, getAllLoading, getAllResponse, getAllError] = useGetLeaveAll2();
  const [update, loadingUpdate, responseUpdate, errorUpdate] = useUpdateLeave2();
  const [deleteLeave, deleteLoading, deleteResponse, deleteUpdate] = useDeleteLeave2();
  const [getUserLoading, getUserResponse, getUserError] = useCurrentUser();

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

  const onDelete = async (id) => {
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
      params.row.note === "" ? "-" : 
      <CustomPopover label="More" text={params.row.note}/>
    ) },
    { field: 'status', headerName: 'Status', type: 'string', flex: 1, },
    { field: 'details', headerName: ' ', disableColumnMenu: true, sortable: false, 
    renderCell: (params) => (
      <SimpleMenu items={[
          {label: "Approve", onClick: (() => onApprove(params.id)), visible: getUserResponse.data.is_admin},
          {label: "Reject", onClick: (() => onReject(params.id)), visible: getUserResponse.data.is_admin},
          {label: "Delete", onClick: (() => onDelete(params.id)), visible: true},
      ]}/>
    ), flex: 0.5},
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
    </Box>
  );
}

export default LeavePending;



{/* <Dialog
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
<Button onClick={ () => {onDelete(); setDialogOpen(false); }} color="primary" autoFocus>
    Yes
</Button>
<Button onClick={() => setDialogOpen(false)} color="primary">
    No
</Button>
</DialogActions>
</Dialog> */}