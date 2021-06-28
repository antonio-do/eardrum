import React, { useEffect, useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Typography } from '@material-ui/core';
import { useGetLeaveAll  } from './hooks';
import { message, Spin } from 'antd';
import moment from 'moment';
import CustomPopover from './components/CustomPopover.js';
import { DATE_FORMAT } from './constants';

const LeaveList = ({year, signal}) => {
  const [resolvedRequests, setResolvedRequests] = useState([]);
  const [getAll, getAllLoading, getAllResponse, getAllError] = useGetLeaveAll();

  useEffect(() => {
    getAll({year: year});
  }, [signal, year])

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
    setResolvedRequests(data.filter(item => item.status !== "pending"));
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
  ];

  return (
    <Box m={2}>
        <Typography variant="h5" gutterBottom>Resolved requests</Typography>
        {(getAllLoading) ? <Spin size="small"/> : <DataGrid
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
