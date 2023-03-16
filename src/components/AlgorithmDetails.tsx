import React from 'react'
import { Nav, Tab } from 'react-bootstrap'
import { useSelector } from 'react-redux'

export const AlgorithmDetails = (): JSX.Element => {

    // Redux
    //const { selectedJob } = useSelector(selectJobs)

    return (
        <div className="job-details-container">
            <h2>Algorithm Details</h2>
            <Tab.Container id="left-tabs-example" defaultActiveKey="general">
                <Nav variant="pills" className="nav-menu">
                    <Nav.Item>
                        <Nav.Link eventKey="general">General</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="inputs">Inputs</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content className="content-padding">
                    <Tab.Pane eventKey="general">
                        {/* {selectedJob ? <GeneralJobInfoTable /> : <div className='subtext'>No algorithm selected</div>} */}
                    </Tab.Pane>
                    <Tab.Pane eventKey="inputs">
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    )
}