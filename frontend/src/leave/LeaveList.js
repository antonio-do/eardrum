import React, { Fragment, useEffect, useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Button, Divider, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { DatePicker } from "@material-ui/pickers";
import { useCurrentYear } from './hooks';

const columns = [
  { field: 'user', headerName: 'User', type: 'string', flex: 1, },
  { field: 'start_date', headerName: 'Start date', type: 'date', flex: 1, },
  { field: 'end_date', headerName: 'End date', type: 'date', flex: 1, },
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

const LeaveList = ({year, setYear}) => {
  const [pendingRequests, setPendingApplications] = useState([]);
  const [resolvedRequests, setResolvedRequests] = useState([]);
  const [date, setDate] = useState(new Date(year, 0, 1));
  const classes = useStyles();

  useEffect(() => {
    getRequests(year);  
  }, [])

  const handleYearChange = (date) => {
    getRequests(date.getFullYear());
    setYear(date.getFullYear());
  }

  const getRequests = (year) => {
    //TODO: replace mock data
    let random_date = () => {
      let start = (new Date(year, 0, 1)).getTime();
      let end = (new Date(year + 1, 0, 1)).getTime();
      return (new Date(start + Math.random() * (end - start)));
    }
    let random_bool = () => (Math.random() < 0.5);
    let random_item = (items) => items[Math.floor(Math.random()*items.length)];

    let names = ["Alice", "Bob", "Eve", "Mallory",]
    let types = ["sick", "rest"];
    let statuses = ["rejected", "approved"];

    let randomData = [];
    for (let i = 0; i < 30; i++) { 
      randomData.push({
        id: i + 1, 
        user: random_item(names), 
        start_date: random_date(), 
        end_date: random_date(),
        type: random_item(types),
        is_half_beginning: random_bool(),
        is_half_end: random_bool(),
        status: "pending",
      })
    }
    setPendingApplications(randomData);

    let randomData2 = [];
    for (let i = 0; i < 20; i++) { 
      randomData2.push({
        id: i, 
        user: random_item(names), 
        start_date: random_date(), 
        end_date: random_date(),
        type: random_item(types),
        is_half_beginning: random_bool(),
        is_half_end: random_bool(),
        status: random_item(statuses),
      })
    }
    setResolvedRequests(randomData2);
  }

  return (
    <Fragment>
      <Box>
        <DatePicker
          views={["year"]}
          label="View data in: "
          value={date}
          onChange={setDate}
          style={{width: '100%'}}
          onYearChange={handleYearChange}
          autoOk
        />
      </Box>
      <Box mt={5}>
        <Typography variant="h5" gutterBottom>Pending requests</Typography>
        <DataGrid
          autoHeight 
          rows={pendingRequests} 
          columns={columns}
          pagination
          pageSize={10}
          disableSelectionOnClick 
        />
      </Box>
        <Divider/>
      <Box mt={5}>
        <Typography variant="h5" gutterBottom>Resolved requests</Typography>
        <DataGrid
          autoHeight 
          rows={resolvedRequests} 
          columns={columns}
          pagination
          pageSize={10}
          disableSelectionOnClick 
        />
      </Box>
   </Fragment>
  );
}

export default LeaveList;
