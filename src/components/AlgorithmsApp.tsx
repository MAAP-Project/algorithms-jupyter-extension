import React, { useState } from 'react';
import { ActionBar } from './ActionBar';
import { Algorithms } from './Algorithms';
import 'bootstrap/dist/css/bootstrap.min.css';
import SplitPane, { Pane } from 'react-split-pane';
import { AlgorithmDetails } from './AlgorithmDetails';

// import { useDispatch } from 'react-redux';

export const AlgorithmsApp = ({ jupyterApp }): JSX.Element => {

  // Redux
  //const dispatch = useDispatch()

  return (
    <SplitPane split="horizontal" defaultSize={200} primary="second">
      <Pane>
        <ActionBar jupyterApp={jupyterApp}/>
        <Algorithms />
      </Pane>
      <Pane>
        <AlgorithmDetails />
      </Pane>
    </SplitPane>
  )
}
