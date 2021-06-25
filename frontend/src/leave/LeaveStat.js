import React, { useContext, useEffect, useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { LeaveContext, useStat } from './hooks';
import { LEAVE_TYPES } from './constants';
import { message, Spin } from 'antd';

const LeaveCalendar = ({year}) => {
    const [stat, setStat] = useState([]);
    const leaveContext = useContext(LeaveContext);
    const statProducer = useStat();
    
    useEffect(() => {
        statProducer.get(year);
    }, [year])

    useEffect(() => {
        if (!statProducer.loading) return;
        if (statProducer.error) {
            console.log(statProducer.error);
            message.error("Error fetching statistic.");
        } else if (statProducer.response) {
            setStat(statProducer.response.data.stats.map((item) => ({
                ...item,
                id: item.user,
            })))            
        }
    }, [statProducer.loading, statProducer.response, statProducer.error])

    const columns = [{ 
        field: 'user', 
        headerName: 'User', 
        type: 'string', 
        flex: 1, 
    }].concat(leaveContext.leaveTypes.map((item) => ({ 
        field: item.name, 
        headerName: item.label, 
        type: 'number', 
        flex: 1, 
    })))
    
    return <Box m={2}>
        <Typography variant="h5" gutterBottom>Statistic</Typography>
         {statProducer.loading ? <Spin size="small"/> : <DataGrid
            autoHeight
            rows={stat}
            columns={columns}
            pagination
            pageSize={10}
            disableColumnMenu
            disableSelectionOnClick
        />}
    </Box>
}

export default LeaveCalendar