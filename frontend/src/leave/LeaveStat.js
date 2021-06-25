import React, { useEffect, useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { useAllUsers } from './hooks';
import { message, Spin } from 'antd';
import { LEAVE_TYPES } from './constants';


const columns = [{ field: 'user', headerName: 'User', type: 'string', flex: 1, }].concat(LEAVE_TYPES.map((item) => ({ 
    field: item.field, 
    headerName: item.label, 
    type: 'number', 
    flex: 1, 
})))

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

    
    return <Box m={2}>
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