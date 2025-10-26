import './App.css';
import React, { useState } from 'react';
import ParentFrontCamera from './components/ParentFrontCamera';
import ParentRearCamera from './components/ParentRearCamera';
import ChildFrontCamera from './components/ChildFrontCamera';
import LidarViewer from './components/LidarViewer';
import Rosconnection from './components/RosConnection';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';

function App() {
  const [ros, setRos] = useState(null);

  return (
    <Container fluid className="p-3">
      <Rosconnection rosUrl="ws://localhost:9090" rosDomainId="89" setRos={setRos} />

      <Row className="g-3">
        <Col lg={6} md={6} sm={12}>
          <ParentFrontCamera ros={ros} />
        </Col>

        <Col lg={6} md={6} sm={12}>
          <ParentRearCamera ros={ros} />
        </Col>

        <Col lg={6} md={6} sm={12}>
          <ChildFrontCamera ros={ros} />
        </Col>

        <Col lg={6} md={6} sm={12}>
          <LidarViewer ros={ros} />
        </Col>
      </Row>

      <hr className="mt-4" />
      <h3 className="text-primary">Connection: <span id="status">N/A</span></h3>
    </Container>
  );
}

export default App;
