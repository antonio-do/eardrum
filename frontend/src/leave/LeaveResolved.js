import React, { useContext, useEffect, useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Typography } from '@material-ui/core';
import { LeaveContext, useGetLeaveAll, useLeaveContext  } from './hooks';
import { message, Spin } from 'antd';
import moment from 'moment';
import CustomPopover from './components/CustomPopover.js';
import { DATE_FORMAT } from './constants';

const LeaveResolved = ({year, signal}) => {
  const [resolvedRequests, setResolvedRequests] = useState([]);
  const [getAll, getAllLoading, getAllResponse, getAllError] = useGetLeaveAll();
  const leaveContext = useContext(LeaveContext);

  useEffect(() => {
    getAll({year: year});
  }, [signal, year])

  useEffect(() => {
    if (!getAllResponse && getAllError) {
      console.log(getAllError);
      message.error("Error fetching leave applications.");
    }
    if (getAllResponse && !getAllLoading && !getAllError) {
      const data = getAllResponse.data.map(item => ({
        id: item.id,
        user: item.user,
        start_date: moment(item.startdate, DATE_FORMAT.VALUE).format(DATE_FORMAT.LABEL),
        end_date: moment(item.enddate, DATE_FORMAT.VALUE).format(DATE_FORMAT.LABEL),
        type: leaveContext.leaveTypesMap[item.typ],
        is_half: (item.half.replace(/[01]/g, (m) => ({
          '0': '[ False ]',
          '1': '[ True ]'
        }[m]))),  
        status: item.status,
        note: item.note,
      }))
      setResolvedRequests(data.filter(item => item.status !== "pending"));
    }
  }, [getAllResponse, getAllError, getAllLoading])

  const columns = [
    { field: 'user', headerName: 'User', type: 'string', flex: 1, },
    { field: 'start_date', headerName: 'Start date', type: 'string', flex: 1, },
    { field: 'end_date', headerName: 'End date', type: 'string', flex: 1, },
    { field: 'type', headerName: 'Type', type: 'string', flex: 1, sortable: false, },
    { field: 'is_half', headerName: 'Half-day leave', type: 'string', flex: 1, 
      description: "Whether the leave request apply for half-day leave on the first and last day, respectively", sortable: false, },
    { field: 'note', headerName: 'Note', type: 'string', flex: 1,
    renderCell: (params) => (
      params.row.note === "" ? <div style={{padding:10}}>-</div> : 
      <CustomPopover label="View" text={params.row.note}/>
    ), sortable: false },
    { field: 'status', headerName: 'Status', type: 'string', flex: 1, sortable: false },
  ];

  return (
    <Box m={2}>
        <Typography variant="h5" gutterBottom>Resolved requests (year {year})</Typography>
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

export default LeaveResolved;
