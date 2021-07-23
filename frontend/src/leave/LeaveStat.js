import React, { useContext, useEffect, useState } from 'react'
import { Box, Typography, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import { DataGrid } from '@material-ui/data-grid';
import { LeaveContext, useGetCapacities, usePatchCapacities, useStat } from './hooks';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import { handleError } from './helpers';
import { Fragment } from 'react';

const LeaveStat = ({year, refreshCount}) => {
    const leaveContext = useContext(LeaveContext);
    const getStat = useStat();
    const [openCapDialog, setOpenCapDialog] = useState(false);
    const getCapacities = useGetCapacities();
    // local version of the capacities, to be submitted to API if required
    const [tempCapacities, setTempCapacities] = useState([])
    const [editRowsModel, setEditRowsModel] = useState({})
    const patchCapacities = usePatchCapacities();
    const [localRefreshCount, setLocalRefreshCount] = useState(0)
    const [statWithCap, setStatWithCap] = useState([])

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
        if (JSON.stringify(getCapacities.data[1]) !== '{}') {
            setTempCapacities(getCapacities.data[1]);
        }
    }, [getCapacities.data])

    useEffect(() => {
        if (JSON.stringify(getCapacities.data[1]) !== '{}' && getStat.data) {
            let arr = JSON.parse(JSON.stringify(getStat.data))
            arr.forEach(obj => {
                leaveContext.leaveTypes.forEach(item => {
                    console.log(getCapacities.data[1])
                    obj[item.name] = obj[item.name] + '/' + getCapacities.data[1][obj.user][item.name]
                })
            })
            setStatWithCap(arr)
        }
    }, [getCapacities.data, getStat.data])

    const statisticsColumns = [{ 
        field: 'user', 
        headerName: 'User', 
        type: 'string', 
        flex: 0.5, 
    }].concat(leaveContext.leaveTypes.map((item) => ({ 
        field: item.name, 
        renderHeader: (params) => (
            <Grid container direction="row">
                <Typography gutterBottom>{item.label}</Typography>
                <Tooltip title={`Number of ${item.label} leave days ` 
                        + `spent for each user/Maximum number of ${item.label} leave days for that user`} >
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
        headerName: item.label,
        type: 'string', 
        sortable: false,
        editable: leaveContext.currentUser.is_admin,
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
        setOpenCapDialog(false)
        await patchCapacities.execute({year: year, capacities: tempCapacities})
        handleError(patchCapacities, "Error updating leave capacities", "Leave capacities updated successfully")
        setLocalRefreshCount(count => count + 1)
    }

    const onCancel = () => {
        setOpenCapDialog(false)
        setTempCapacities(getCapacities.data[1])
    }
    
    return <Box m={2}>
        <Grid container direction="row" justify='space-between'>
            <Grid item>
                <Typography variant="h5" gutterBottom>Statistic (year {year})</Typography>
            </Grid>
            <Grid item>
                <Button variant="outlined" onClick={() => setOpenCapDialog(true)}>{leaveContext.currentUser.is_admin ? "View/Edit" : "View"} leave capacity</Button>
            </Grid>
        </Grid>
         <DataGrid
            autoHeight
            rows={statWithCap}
            columns={statisticsColumns}
            pagination
            pageSize={10}
            disableSelectionOnClick
            loading={getStat.loading}
        />
        <Dialog open={openCapDialog} onClose={() => setOpenCapDialog(false)} fullWidth maxWidth='lg'>
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
                {leaveContext.currentUser.is_admin 
                    ?   <Fragment>
                            <Button onClick={onSubmit} color="primary">
                                Submit
                            </Button>
                            <Button onClick={onCancel} color="primary" autoFocus>
                                Cancel
                            </Button>
                        </Fragment>
                    :   <Button onClick={() => setOpenCapDialog(false)} color="primary">
                            Back
                        </Button>}
            </DialogActions>
        </Dialog>
    </Box>
}

export default LeaveStat
