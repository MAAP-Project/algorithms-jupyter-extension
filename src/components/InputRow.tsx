import React from 'react';
import { Form } from 'react-bootstrap';
import { ALGO_INPUT_FIELDS } from '../constants';
import { BsFillXCircleFill } from 'react-icons/bs';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

export const InputRow = ({row, handleRemoveRow, handleDataChange }) => {
    return (
        <TableRow id={row.inputId.toString()}>
            <TableCell> </TableCell>
            <TableCell sx={{ '& .MuiTextField-root': { m: 1, width: '35ch' } }} id={ALGO_INPUT_FIELDS.INPUT_NAME}>
                <TextField
                    id="outlined-textarea"
                    placeholder="What is the input name?"
                    size="small"
                    onChange={handleDataChange}
                    value={row.inputName}/>
            </TableCell>
            <TableCell sx={{ '& .MuiTextField-root': { m: 1, width: '35ch' } }} id={ALGO_INPUT_FIELDS.INPUT_DESC}>
                <TextField
                    id="outlined-textarea"
                    placeholder="Describe the input parameter"
                    size="small" 
                    onChange={handleDataChange}
                    value={row.inputDesc}/>
            </TableCell>
            <TableCell sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }} id={ALGO_INPUT_FIELDS.IS_REQUIRED}>
                <Switch
                    name="required"
                    onChange={handleDataChange}
                    checked={row.isRequired}/>
            </TableCell>
            <TableCell sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }} id={ALGO_INPUT_FIELDS.INPUT_DEFAULT}>
                <TextField
                    id="outlined-textarea"
                    placeholder="Default value"
                    size="small" 
                    onChange={handleDataChange}
                    value={row.inputDefault}/>
            </TableCell>
            <TableCell sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }} id={ALGO_INPUT_FIELDS.INPUT_DEFAULT}>
                <BsFillXCircleFill className="danger-icon" id={row.inputId.toString()} onClick={() => handleRemoveRow(row.inputId.toString())}/>
            </TableCell>
        </TableRow>
    )
}