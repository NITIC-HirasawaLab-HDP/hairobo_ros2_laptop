import './App.css';
import React, { useState } from 'react';
import ParentFrontCamera from './components/ParentFrontCamera';
import ParentRearCamera from './components/ParentRearCamera';
import ChildFrontCamera from './components/ChildFrontCamera';
import LidarViewer from './components/LidarViewer';
import Rosconnection from './components/RosConnection';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [ros, setRos] = useState(null);

  return (
    <div className="app-container">
      <Rosconnection rosUrl={`ws://${window.location.hostname}:9090`} rosDomainId="89" setRos={setRos} />
      {/* <Rosconnection rosUrl="ws://localhost:9090" rosDomainId="89" setRos={setRos} /> */}

      <div className="video-grid">
        <div className="video-item">
          <ParentFrontCamera ros={ros} />
        </div>

        <div className="video-item">
          <ParentRearCamera ros={ros} />
        </div>

        <div className="video-item">
          <ChildFrontCamera ros={ros} />
        </div>

        <div className="video-item">
          <LidarViewer ros={ros} />
        </div>
      </div>

      <div className="status-bar">
        <h3 className="text-primary">Connection: <span id="status">N/A</span></h3>
      </div>
    </div>
  );
}

export default App;
