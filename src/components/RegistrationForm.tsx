import React from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { BsArrowRightShort } from "react-icons/bs";
import { InputsTable } from './InputsTable';

export const RegistrationForm = () => {

    return (
        <Form>
            <h2>Repository Information</h2>
            <Table className="form-table">
                <tbody>
                    <tr>
                        <td>Repository URL</td>
                        <td>
                            <Form.Control type="text" placeholder="Enter repository URL" />
                        </td>
                    </tr>
                    <tr>
                        <td>Repository Branch</td>
                        <td>
                            <Form.Control type="text" placeholder="Enter repository branch" />
                        </td>
                    </tr>
                </tbody>
            </Table>

            <h2>General Information</h2>
            <Table className="form-table">
                <tbody>
                    <tr>
                        <td>Algorithm Name</td>
                        <td>
                            <Form.Control type="text" placeholder="Enter algorithm name" />
                        </td>
                    </tr>
                    <tr>
                        <td>Algorithm Description</td>
                        <td>
                            <Form.Control type="textarea" placeholder="Enter algorithm description" />
                        </td>
                    </tr>
                    <tr>
                        <td>Disk Space (GB)</td>
                        <td>
                            <Form.Control type="text" placeholder="Enter disk space" />
                        </td>
                    </tr>
                    <tr>
                        <td>Resource Allocation</td>
                        <td>
                            <Form.Control type="text" placeholder="Enter resource allocation" />
                        </td>
                    </tr>
                </tbody>
            </Table>

            <h2>Input Parameters</h2>
            <InputsTable header="Configuration Inputs" description="test"/>
            <InputsTable header="File Inputs" description="another test"/>

            <Button variant="primary" type="submit">
                Review Configuration <BsArrowRightShort size={20} />
            </Button>
        </Form>
    )
}