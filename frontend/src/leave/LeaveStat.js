import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { useCurrentYear, useAllUsers } from './hooks';
import { message, Spin } from 'antd';

const columns = [
    { field: 'user', headerName: 'User', type: 'string', flex: 1, },
    { field: 'type1', headerName: 'Type 1', type: 'number', flex: 1, },
    { field: 'type2', headerName: 'Type 2', type: 'number', flex: 1, },
    { field: 'type3', headerName: 'Type 3', type: 'number', flex: 1, },
    { field: 'type4', headerName: 'Type 4', type: 'number', flex: 1, },
    { field: 'type5', headerName: 'Type 5', type: 'number', flex: 1, },
]

const LeaveCalendar = ({year}) => {
    const [stat, setStat] = useState([]);
    const [loading, res, error] = useAllUsers();

    useEffect(() => {
        if (!res && error) {
            console.log(error);
            message.error('Errors occured while fetching users!');
        }
    }, [res, error])

    useEffect(() => {
        if (!loading) {
            getStat();
        }
    }, [loading])

    //useEffect(() => {}, [loading])
    const getStat = () => {
        //TODO: replace mock data
        const gen = () => Math.random() * 15;
        let names = res.data.users;

        let randomData = [];
        for (let i = 0; i < names.length; i++) {
            randomData.push({
                id: i,
                user: names[i].username,
                type1: gen(),
                type2: gen(),
                type3: gen(),
                type4: gen(),
                type5: gen(),
            })
        }
        setStat(randomData);
    }

    
    return <Box mt={5}>
        <Typography variant="h5" gutterBottom>Statistic</Typography>
         {loading ? <Spin size="small"/> : <DataGrid
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