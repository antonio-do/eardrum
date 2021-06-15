import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { useCurrentYear } from './hooks';

const columns = [
    { field: 'user', headerName: 'User', type: 'string', flex: 1, },
    { field: 'type1', headerName: 'Type 1', type: 'number', flex: 1, },
    { field: 'type2', headerName: 'Type 2', type: 'number', flex: 1, },
    { field: 'type3', headerName: 'Type 3', type: 'number', flex: 1, },
    { field: 'type4', headerName: 'Type 4', type: 'number', flex: 1, },
    { field: 'type5', headerName: 'Type 5', type: 'number', flex: 1, },
]

const LeaveCalendar = ({year, setYear}) => {
    const [stat, setStat] = useState([]);

    useEffect(() => {
        getStat(year);
    }, [])

    const getStat = (year) => {
        //TODO: replace mock data
        const gen = () => Math.random() * 15;
        let names = ["Alice", "Bob", "Eve", "Mallory"]

        let randomData = [];
        for (let i = 0; i < 4; i++) {
            randomData.push({
                id: i,
                user: names[i],
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
        <DataGrid
            autoHeight
            rows={stat}
            columns={columns}
            pagination
            pageSize={10}
            disableColumnMenu
            disableSelectionOnClick
        />
    </Box>
}

export default LeaveCalendar