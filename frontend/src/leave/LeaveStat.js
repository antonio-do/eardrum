import React, { useContext, useEffect, useState } from 'react'
import { Box, Typography, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import { DataGrid } from '@material-ui/data-grid';
import { LeaveContext, useGetCapacities, usePatchCapacities, useStat } from './hooks';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import { handleError } from './helpers';

const LeaveStat = ({year, refreshCount}) => {
    const leaveContext = useContext(LeaveContext);
    const getStat = useStat();
    const [open, setOpen] = useState(false);
    const getCapacities = useGetCapacities();
    const [tempCapacities, setTempCapacities] = useState([])
    const [editRowsModel, setEditRowsModel] = useState({})
    const patchCapacities = usePatchCapacities();
    const [localRefreshCount, setLocalRefreshCount] = useState(0)

    useEffect(() => {
        const fetchApi = async () => {
            getStat.execute({year: year});
            handleError(getStat, "Error fetching statistics.");
        }

        fetchApi();
    }, [year, refreshCount])

    useEffect(() => {
        const fetchApi = async () => {
            await getCapacities.execute({year: year})
            handleError(getCapacities, "Error fetching leave capacities");
        }

        fetchApi();
    }, [year, localRefreshCount])

    useEffect(() => {
        if (getCapacities.data) {
            setTempCapacities(getCapacities.data[1]);
        }
    }, [getCapacities.data])

    const statisticsColumns = [{ 
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
        disableColumnMenu: true,
    })))

    const capacitiesColumns = [{ 
        field: 'user', 
        headerName: 'User', 
        type: 'string', 
        flex: 0.5,
    }].concat(leaveContext.leaveTypes.map((item) => ({ 
        field: item.name, 
        type: 'string', 
        sortable: false,
        editable: true,
        flex: 1, 
        disableColumnMenu: true,
    })))
    
    // https://material-ui.com/components/data-grid/editing/
    const handleEditCellChange = ({ id, field, props }) => {
        const data = props; // Fix eslint value is missing in prop-types for JS files
        const isValid = !isNaN(data.value);
        const newState = {};
        newState[id] = {
          ...editRowsModel[id],
        }
        if (!isNaN(data.value)) data.value = Number(data.value)
        newState[id][field] = { ...props, error: !isValid }

        setEditRowsModel((state) => ({ ...state, ...newState }));
    }

    const handleEditCellChangeCommitted = (params) => {
        setTempCapacities(temp => {
            let obj = JSON.parse(JSON.stringify(temp));
            obj[params.id][params.field] = Number(params.props.value);
            return obj
        })
    }

    const onSubmit = async () => {
        setOpen(false)
        await patchCapacities.execute({year: year, capacities: tempCapacities})
        handleError(patchCapacities, "Error updating leave capacities", "Leave capacities updated successfully")
        setLocalRefreshCount(count => count + 1)
    }

    const onCancel = () => {
        setOpen(false)
        setTempCapacities(getCapacities.data[1])
    }
    
    return <Box m={2}>
        <Grid container direction="row" justify='space-between'>
            <Grid item>
                <Typography variant="h5" gutterBottom>Statistic (year {year})</Typography>
            </Grid>
            <Grid item>
                <Button variant="outlined" onClick={() => setOpen(true)}>Edit leave capacity</Button>
            </Grid>
        </Grid>
         <DataGrid
            autoHeight
            rows={getStat.data}
            columns={statisticsColumns}
            pagination
            pageSize={10}
            disableSelectionOnClick
            loading={getStat.loading}
        />
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='lg'>
            <DialogTitle>Leave capacity</DialogTitle>
            <DialogContent>
                <DataGrid
                    autoHeight
                    rows={getCapacities.data[0]}
                    columns={capacitiesColumns}
                    pagination
                    pageSize={10}
                    loading={getCapacities.loading}
                    editRowsModel={editRowsModel}
                    disableSelectionOnClick
                    onEditCellChange={handleEditCellChange}
                    onEditCellChangeCommitted={handleEditCellChangeCommitted}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onSubmit} color="primary">
                    Submit
                </Button>
                <Button onClick={onCancel} color="primary" autoFocus>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
}

export default LeaveStat
