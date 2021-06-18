import React, { useEffect, useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Button, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useGetLeaveAll  } from './hooks';
import { message, Spin } from 'antd';

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
    <Button
      color="primary"
      size="small"
      to={`/leave/${params.id}`}
      component={Link}
    >
      View
    </Button>
  )},
];

const LeavePending = () => {
  const [pendingRequests, setPendingApplications] = useState([]);
  const [loading, leaveData, error] = useGetLeaveAll();

  useEffect(() => {
    if (!leaveData && error) {
      console.log(error);
      message.error("Error fetching leave applications.");
    }
  }, [leaveData, error])

  useEffect(() => {
    if (!loading) {
      getRequests();  
    }
  }, [loading])

  const getRequests = () => {
    const data = leaveData.data.map(item => ({
      id: item.id,
      user: item.user,
      start_date: item.startdate,
      end_date: item.enddate,
      type: item.typ,
      is_half_beginning: item.half === "true",
      is_half_end: item.half === "true",
      status: item.status,
    }))
    setPendingApplications(data.filter(item => item.status === "pending"));
  }

  return (
    <Box mt={5}>
        <Typography variant="h5" gutterBottom>Pending requests</Typography>
        {loading ? <Spin size="small"/> : <DataGrid
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
