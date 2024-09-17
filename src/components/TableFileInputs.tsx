import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Row, /*Table, */Tooltip } from 'react-bootstrap';
import { BsPlusCircleFill, BsInfoCircle, BsFillInfoCircleFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { algorithmActions, selectAlgorithm } from '../redux/slices/algorithmSlice'
import { ALGO_INPUTS, ALGO_INPUTS_DESC, ALGO_INPUT_FIELDS } from '../constants';
import { InputRow } from './InputRow';
import { EmptyRow } from './EmptyRow';
import { Tooltip as ReactTooltip } from "react-tooltip";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';

export const TableFileInputs = () => {

    // Redux
    const dispatch = useDispatch()

    const { fileData, inputId } = useSelector(selectAlgorithm)
    const { addFileData, updateFileData, removeFileData, incrementInputId } = algorithmActions

    const addRow = () => {
        dispatch(addFileData({[ALGO_INPUT_FIELDS.INPUT_NAME]: "", 
                              [ALGO_INPUT_FIELDS.INPUT_DEFAULT]: "", 
                              [ALGO_INPUT_FIELDS.INPUT_DESC]: "", 
                              [ALGO_INPUT_FIELDS.IS_REQUIRED]: false, 
                              [ALGO_INPUT_FIELDS.INPUT_ID]: inputId }))
        dispatch(incrementInputId())
    }

    const handleDataChange = e => {
        console.log("graceal1 in handleDataChange");
        switch (e.target.type) {
            case "checkbox": {
                dispatch(updateFileData({inputId: e.target.parentNode.parentNode.parentNode.id, inputField: [e.target.id], inputValue: e.target.checked}))
                break;
            }
            default: dispatch(updateFileData({inputId: e.target.parentNode.parentNode.id, inputField: [e.target.id], inputValue: e.target.value}))
            break;
        }
    }

    const handleRemoveRow = (inputId) => {
        dispatch(removeFileData({key: inputId}))
    }

    return (
        <div>
            <div className="input-types">
                <h4>File Inputs</h4>
                <ReactTooltip
                        anchorId="file_input_info"
                        place="right"
                        variant="dark"
                        content={ALGO_INPUTS_DESC.FILE_INPUTS}
                />
                <span id="file_input_info"><BsInfoCircle /></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" sx={{ border: 'none' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell><BsPlusCircleFill className="success-icon" onClick={addRow} /></TableCell>
                                <TableCell align="left">Name</TableCell>
                                <TableCell align="left">Description</TableCell>
                                <TableCell align="center">Required?</TableCell>
                                <TableCell align="left">Default Value</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fileData.length == 0 ? <TableRow><EmptyRow text="No inputs specified"/></TableRow> : Object.entries(fileData).map(([key, data]) => {
                                return <InputRow row={data} handleRemoveRow={handleRemoveRow} handleDataChange={handleDataChange}/>
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    )
}