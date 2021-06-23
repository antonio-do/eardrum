import React, { useEffect, useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Button, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useCurrentUser, useDeleteLeave2, useGetLeaveAll2  } from './hooks';
import { message, Spin } from 'antd';
import SimpleMenu from './components/Menu'
import moment from 'moment';
import CustomPopover from './components/CustomPopover.js';
import DeleteDialog from './components/DeleteDialog';

const DATE_FORMAT = "DD/MM/YYYY";

const LeaveList = ({year, toggle}) => {
  const [resolvedRequests, setResolvedRequests] = useState([]);
  const [getAll, getAllLoading, getAllResponse, getAllError] = useGetLeaveAll2();
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
  }, [toggle])

  useEffect(() => {
    if (!getAllResponse && getAllError) {
      console.log(getAllError);
      message.error("Error fetching leave applications.");
    }
    if (getAllResponse && !getAllLoading && !getAllError) {
      getRequests();
    }
  }, [year, getAllResponse, getAllError, getAllLoading])

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
    setResolvedRequests(data.filter(item => item.status !== "pending" && moment(item.start_date, DATE_FORMAT).year() === year));
  }

  const onDelete = (id) => {
    setLeaveId(id);
    setOpenDialog(true);
  }

  const onDeleteConfirm = async (id) => {
    await deleteLeave(id);
    await getAll();
    getRequests();
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
    renderCell: (params) => getUserResponse.data.is_admin && (
      <Button color='primary' style={{margin: 5}} onClick={() => onDelete(params.id)}>
        Delete
      </Button>
    ), width: 100, hidden: getUserResponse && !getUserResponse.data.is_admin},
  ];

  return (
    <Box m={2}>
        <Typography variant="h5" gutterBottom>Resolved requests</Typography>
        {(getAllLoading || getUserLoading) ? <Spin size="small"/> : <DataGrid
            autoHeight 
            rows={resolvedRequests} 
            columns={columns}
            pagination
            pageSize={10}
            disableSelectionOnClick 
        />}
        <DeleteDialog onDelete={() => onDeleteConfirm(leaveId)} open={openDialog} setOpen={setOpenDialog}/> 
    </Box>
  );
}

export default LeaveList;
