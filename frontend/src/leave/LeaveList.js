import React, { Fragment, useEffect, useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Button, Divider, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { useGetLeaveAll  } from './hooks';
import { message, Spin } from 'antd';
import moment from 'moment';

const DATE_FORMAT = "DD/MM/YYYY";

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

const useStyles = makeStyles(theme => ({
  root: {
    padding: 10,
  }
}));

const LeaveList = ({year}) => {
  const [pendingRequests, setPendingApplications] = useState([]);
  const [resolvedRequests, setResolvedRequests] = useState([]);
  const [date, setDate] = useState(new Date(year, 0, 1));
  const classes = useStyles();
  const [loading, leaveData, error] = useGetLeaveAll();

  useEffect(() => {
    if (!leaveData && error) {
      console.log(error);
      message.error("Error fetching leave applications.");
    }
  }, [leaveData, error])

  useEffect(() => {
    if (!loading) {
      getRequests(year);  
    }
  }, [year, loading])

  const getRequests = (year) => {
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
    setResolvedRequests(data.filter(item => item.status !== "pending" && moment(item.start_date, DATE_FORMAT).year() === year));
  }

  return (
    <Fragment>
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
        <Divider/>
      <Box mt={5}>
        <Typography variant="h5" gutterBottom>Resolved requests</Typography>
        {loading ? <Spin size="small"/> : <DataGrid
          autoHeight 
          rows={resolvedRequests} 
          columns={columns}
          pagination
          pageSize={10}
          disableSelectionOnClick 
        />}
      </Box>
   </Fragment>
  );
}

export default LeaveList;