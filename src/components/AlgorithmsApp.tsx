import React, { useState, useEffect } from 'react';
import { ActionBar } from './ActionBar';
import { Algorithms } from './Algorithms';
import 'bootstrap/dist/css/bootstrap.min.css';
import SplitPane from 'react-split-pane';
import Pane from 'react-split-pane';
import { AlgorithmDetails } from './AlgorithmDetails';
import { useDispatch } from 'react-redux';
import { splitPaneActions } from '../redux/slices/splitPaneSlice'
import { describeAlgorithms, describeAllAlgorithms, getAlgorithms } from '../utils/api';

// import { useDispatch } from 'react-redux';

export const AlgorithmsApp = ({ jupyterApp }): JSX.Element => {

  // Redux
  const dispatch = useDispatch()
  const { updateSize } = splitPaneActions

  useEffect(() => {
    getAlgorithms()
  }, []);


  const handleDragFinish = (size: any) => {
    console.log("Sizes: ")
    console.log(size)
      let newSize = Math.floor(size[0]/4000) - 1
      if (newSize < 1) { newSize = 1}
      console.log(newSize)
      dispatch(updateSize(newSize))
  }

  return (
    <SplitPane split="horizontal" defaultSize={200} primary="first" onChange={(size: any) => handleDragFinish(size)}>
      <Pane className="relative">
        <Algorithms jupyterApp={jupyterApp} />
      </Pane>
      <Pane>
        <AlgorithmDetails />
      </Pane>
    </SplitPane>
  )
}
