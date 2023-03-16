import React from 'react';
import { Table } from 'react-bootstrap';
import { BsPlusCircleFill } from 'react-icons/bs';
import { InputRow } from './InputRow';

export const InputsTable = ({ header, description }) => {

    return (
        <div>
            <h3>{header}</h3>
            <p>{description}</p>
            <Table className="inputs-table">
                <thead>
                    <tr>
                        <td><BsPlusCircleFill className="add-icon" /></td>
                        <td>Name</td>
                        <td>Description</td>
                        <td>Required?</td>
                        <td>Default Value</td>
                        <td></td>
                    </tr>
                </thead>
                <InputRow />
            </Table>
        </div>
    )
}