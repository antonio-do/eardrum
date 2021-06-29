import React, { useContext, useEffect, useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { LeaveContext, useStat } from './hooks';
import { message, Spin } from 'antd';

const LeaveCalendar = ({year}) => {
    const [stat, setStat] = useState([]);
    const leaveContext = useContext(LeaveContext);
    const statisticsFetch = useStat();
    
    useEffect(() => {
        statisticsFetch.get(year);
    }, [year])

    useEffect(() => {
        if (!statisticsFetch.loading) return;
        if (statisticsFetch.error) {
            console.log(statisticsFetch.error);
            message.error("Error fetching statistic.");
        } else if (statisticsFetch.response) {
            setStat(statisticsFetch.response.data.stats.map((item) => ({
                ...item,
                id: item.user,
            })))            
        }
    }, [statisticsFetch.loading, statisticsFetch.response, statisticsFetch.error])

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
         {statisticsFetch.loading ? <Spin size="small"/> : <DataGrid
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