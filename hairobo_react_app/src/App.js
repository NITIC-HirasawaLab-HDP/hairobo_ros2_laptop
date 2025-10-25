import './App.css';
import React, { useState } from 'react';
import CameraData from './components/CameraData';
import Rosconnection from './components/RosConnection';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col } from 'react-bootstrap';

function App() {
  const [ros, setRos] = useState(null);
  return (
    <>
      {/* <Rosconnection rosUrl="ws://localhost:9090" rosDomainId="89"> */}
      <Rosconnection rosUrl="ws://localhost:9090" rosDomainId="89" setRos={setRos} />
      {ros &&
        <>
          <Row>
            <Col>
              <div className="d-flex justify-content-center align-items-center">
                <CameraData ros={ros} />
              </div>
            </Col>
          </Row>
        </>
      }

      <hr />
      <h3 className="text-blue-600 font-bold text-xl">Connection: <span id="status">N/A</span></h3>
      <div className="bg-green-100 p-4 rounded-lg mt-4">
        <p className="text-green-800">Tailwind CSS is working! 🎉</p>
      </div>
    </>
  );
}

export default App;
