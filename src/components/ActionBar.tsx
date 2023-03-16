import React from 'react';
import { Button } from 'react-bootstrap';
import '../../style/actionBar.css';
import { JUPYTER_EXT } from '../constants'


export const ActionBar = ({jupyterApp}) => {

    const openRegistration = () => {
        if (jupyterApp.commands.hasCommand(JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND)) {
            jupyterApp.commands.execute(JUPYTER_EXT.REGISTER_ALGORITHM_OPEN_COMMAND)
        }
    }
    
    return (
        <div className="action-bar">
            <Button variant="primary" onClick={openRegistration}>+ New Algorithm</Button>
        </div>
    )
}