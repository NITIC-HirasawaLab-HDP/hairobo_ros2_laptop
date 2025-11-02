import { useState } from 'react';
import ROSLIB from 'roslib';
// カメラ・LiDAR・ROS接続コンポーネントをインポート
import ParentFrontCamera from './components/video/ParentFrontCamera';
import ParentRearCamera from './components/video/ParentRearCamera';
import ChildFrontCamera from './components/video/ChildFrontCamera';
import LidarViewer from './components/video/LidarViewer';
import RosConnection from './components/status/RosConnection';
import TimerBar from './components/ui/TimerBar';

function App() {
  const [ros, setRos] = useState<ROSLIB.Ros | null>(null);

  return (
    <div className="w-screen h-screen flex flex-col bg-transparent overflow-hidden gap-8 py-8">
      <div className="flex gap-4 overflow-x-auto">
        <RosConnection rosUrl={`ws://${window.location.hostname}:9090`} rosDomainId={89} setRos={setRos} />
        {/* <Rosconnection rosUrl="ws://localhost:9090" rosDomainId={89} setRos={setRos} /> */}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2 grid-rows-2 gap-8 w-[90vw] h-[80vh] max-w-[1280px] max-h-[960px]">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg border border-gray-300 shadow-lg flex items-center justify-center">
            <ParentFrontCamera ros={ros} />
          </div>

          <div className="w-full h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg border border-gray-300 shadow-lg flex items-center justify-center">
            <ParentRearCamera ros={ros} />
          </div>

          <div className="w-full h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg border border-gray-300 shadow-lg flex items-center justify-center">
            <ChildFrontCamera ros={ros} />
          </div>

          <div className="w-full h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg border border-gray-300 shadow-lg flex items-center justify-center">
            <LidarViewer ros={ros} />
          </div>
        </div>
      </div>

      {/* タイマーバーを画面下部に配置 */}
      <TimerBar totalTime={600} />
    </div>
  );
}

export default App;
