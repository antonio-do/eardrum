import React, { useContext, useEffect, useState } from 'react'
import { Box, Typography, Tooltip,Grid } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { LeaveContext, useStat } from './hooks';
import { message, Spin } from 'antd';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';

const LeaveCalendar = ({year, signal}) => {
    const [stat, setStat] = useState([]);
    const leaveContext = useContext(LeaveContext);
    const getStat = useStat();
    
    useEffect(() => {
        setTimeout(() => getStat.execute({year: year}), 1000);
    }, [year, signal])

    useEffect(() => {
        if (!getStat.loading) return;
        if (getStat.error) {
            console.error(getStat.error);
            message.error("Error fetching statistic.");
        } else if (getStat.data) {
            setStat(getStat.data.data.stats.map((item) => ({
                ...item,
                id: item.user,
            })))            
        }
    }, [getStat.loading, getStat.data, getStat.error])

    const columns = [{ 
        field: 'user', 
        headerName: 'User', 
        type: 'string', 
        flex: 0.5, 
    }].concat(leaveContext.leaveTypes.map((item) => ({ 
        field: item.name, 
        renderHeader: (params) => (
            <Grid container direction="row">
                <Typography gutterBottom>{item.label} (max: {item.limitation}d)</Typography>
                <Tooltip title={`Number of ${item.label} leave days ` 
                        + `spent for each user (max: ${item.limitation} days)`} >
                    <HelpOutlineOutlinedIcon style={{marginLeft:5}} fontSize="small"/>
                </Tooltip>
            </Grid>
        ), 
        type: 'string', 
        sortable: false,
        flex: 1, 
    })))
    
    return <Box m={2}>
        <Typography variant="h5" gutterBottom>Statistic (year {year})</Typography>
         {getStat.loading ? <Spin size="small"/> : <DataGrid
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
