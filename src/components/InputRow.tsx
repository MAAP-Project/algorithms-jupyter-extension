import React from 'react';
import { Form } from 'react-bootstrap';
import { BsFillXCircleFill } from 'react-icons/bs';

export const InputRow = () => {

    return (
        <tr className="input-row">
            <td></td>
            <td><Form.Control type="text" placeholder="What is the input name?" /></td>
            <td><Form.Control type="text" placeholder="Describe the input parameter" /></td>
            <td>
                <Form.Select size="sm">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </Form.Select>
            </td>
            <td><Form.Control type="text" placeholder="Default value" /></td>
            <td><span><BsFillXCircleFill className="remove-icon" /></span></td>
        </tr>
    )
}