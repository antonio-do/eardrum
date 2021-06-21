import React, { useEffect, useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Button, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useCurrentUser, useDeleteLeave2, useGetLeaveAll2  } from './hooks';
import { message, Spin } from 'antd';
import SimpleMenu from './components/Menu'
import moment from 'moment';

const DATE_FORMAT = "DD/MM/YYYY";

const LeaveList = ({year}) => {
  const [resolvedRequests, setResolvedRequests] = useState([]);
  const [getAll, getAllLoading, getAllResponse, getAllError] = useGetLeaveAll2();
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
      is_half_beginning: item.half === "true",
      is_half_end: item.half === "true",
      status: item.status,
    }))
    setResolvedRequests(data.filter(item => item.status !== "pending" && moment(item.start_date, DATE_FORMAT).year() === year));
  }

  const onDelete = async (id) => {
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
    { field: 'status', headerName: 'Status', type: 'string', flex: 1, },
    { field: 'details', headerName: ' ', disableColumnMenu: true, sortable: false, 
    renderCell: (params) => (
      <SimpleMenu items={[
          {label: "Delete", onClick: (() => onDelete(params.id)), visible: getUserResponse.data.is_admin},
      ]}/>
    ), flex: 0.5},
  ];

  if (getUserLoading || getAllLoading) {
    return <Spin size="small" />
  }

  return (
    <Box mt={5}>
        <Typography variant="h5" gutterBottom>Resolved requests</Typography>
        {getAllLoading ? <Spin size="small"/> : <DataGrid
            autoHeight 
            rows={resolvedRequests} 
            columns={columns}
            pagination
            pageSize={10}
            disableSelectionOnClick 
        />}
    </Box>
  );
}

export default LeaveList;
