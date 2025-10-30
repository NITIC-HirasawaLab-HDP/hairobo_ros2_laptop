import React, { useState } from 'react';
import ROSLIB from 'roslib';
import ParentFrontCamera from './components/ParentFrontCamera';
import ParentRearCamera from './components/ParentRearCamera';
import ChildFrontCamera from './components/ChildFrontCamera';
import LidarViewer from './components/LidarViewer';
import Rosconnection from './components/RosConnection';

function App() {
  const [ros, setRos] = useState<ROSLIB.Ros | null>(null);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-100 overflow-hidden">
      <Rosconnection rosUrl={`ws://${window.location.hostname}:9090`} rosDomainId={89} setRos={setRos} />
      {/* <Rosconnection rosUrl="ws://localhost:9090" rosDomainId={89} setRos={setRos} /> */}

      <div className="grid grid-cols-1 grid-rows-4 gap-3 w-[95vw] h-[85vh] p-4 md:grid-cols-2 md:grid-rows-2 md:gap-4 md:w-[90vw] md:h-[80vh] max-w-[1280px] max-h-[960px]">
        <div className="w-full h-full border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-md">
          <ParentFrontCamera ros={ros} />
        </div>

        <div className="w-full h-full border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-md">
          <ParentRearCamera ros={ros} />
        </div>

        <div className="w-full h-full border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-md">
          <ChildFrontCamera ros={ros} />
        </div>

        <div className="w-full h-full border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-md">
          <LidarViewer ros={ros} />
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-100/95 px-4 py-2 rounded-full border border-gray-300 shadow-lg">
        <h3 className="text-blue-600 m-0 text-sm font-medium">Connection: <span id="status">N/A</span></h3>
      </div>
    </div>
  );
}

export default App;
