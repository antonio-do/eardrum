import React, { useContext, useEffect, useState } from 'react'
import { Box, Typography, Tooltip,Grid } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { LeaveContext, useStat } from './hooks';
import { message, Spin } from 'antd';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

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
        flex: 0.5, 
    }].concat(leaveContext.leaveTypes.map((item) => ({ 
        field: item.name, 
        headerName: item.label + ` (max: ${item.limitation} days)`, 
        type: 'number', 
        flex: 1, 
    })))
    
    return <Box m={2}>
        <Grid container direction="row">
            <Typography variant="h5" gutterBottom>Statistic (year {year})</Typography>
            <Tooltip title="Number of leave days spent for each user and each type"  >
                <InfoOutlinedIcon style={{marginLeft:5}}/>
            </Tooltip>
        </Grid>
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