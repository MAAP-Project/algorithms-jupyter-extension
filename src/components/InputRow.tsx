import React from 'react';
import { Form } from 'react-bootstrap';
import { ALGO_INPUT_FIELDS } from '../constants';
import { BsFillXCircleFill } from 'react-icons/bs';

export const InputRow = ({row, index, inputType, handleRemoveRow, handleDataChange }) => {
    return (
        <table className="input-table">
            <thead className="table-input-header"><strong>{inputType} argument {index+1}</strong></thead>
            <tbody>
                <tr>
                    <td><strong>Name</strong></td>
                    <td>
                        <Form.Control
                            id={ALGO_INPUT_FIELDS.INPUT_NAME}
                            type="text"
                            className="input-cell"
                            placeholder="What is the input name?"
                            onChange={handleDataChange}
                            value={row.inputName}
                        />
                    </td>
                </tr>
                <tr>
                    <td><strong>Description</strong></td>
                    <td>
                        <Form.Control
                            id={ALGO_INPUT_FIELDS.INPUT_DESC}
                            type="text"
                            className="input-cell"
                            placeholder="Describe the input parameter"
                            onChange={handleDataChange}
                            value={row.inputDesc}
                        />
                    </td>
                </tr>
                <tr>
                    <td><strong>Default</strong></td>
                    <td>
                        <Form.Control
                            id={ALGO_INPUT_FIELDS.INPUT_DEFAULT}
                            type="text"
                            className="input-cell"
                            placeholder="Enter the default value"
                            onChange={handleDataChange}
                            value={row.inputDefault}
                        />
                    </td>
                </tr>
                <tr>
                    <td><strong>Required</strong></td>
                    <td>
                        <Form.Switch
                            id={ALGO_INPUT_FIELDS.IS_REQUIRED}
                            className="left-align"
                            aria-label="required_input"
                            onChange={handleDataChange}
                            checked={row.isRequired}
                        />
                    </td>
                </tr>
                <tr>
                    <td colSpan={2} className="left-align">
                        <BsFillXCircleFill
                            className="danger-icon"
                            id={row.inputId.toString()}
                            onClick={() => handleRemoveRow(row.inputId.toString())}
                        />
                    </td>
                </tr>
            </tbody>
        </table>

    )
}