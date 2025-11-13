import { useState } from 'react';
import ROSLIB from 'roslib';
// カメラ・LiDAR・ROS接続コンポーネントをインポート
import ParentFrontCamera from './components/video/ParentFrontCamera';
import ParentRearCamera from './components/video/ParentRearCamera';
import ChildFrontCamera from './components/video/ChildFrontCamera';
import LidarViewer from './components/video/LidarViewer';
import RosConnection from './components/status/RosConnection';
import OperationMode from './components/status/OperationMode';
import BrushCommand from './components/status/BrushCommand';
import WinchLan from './components/status/WinchLan';
import WinchChild from './components/status/WinchChild';
import TimerBar from './components/ui/TimerBar';

function App() {
  const [ros, setRos] = useState<ROSLIB.Ros | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-transparent overflow-hidden gap-0">
      {/* ステータス (ヘッダー) */}
      <header className="flex my-3 justify-center gap-4">
        <RosConnection rosUrl={`ws://${window.location.hostname}:9090`} rosDomainId={89} setRos={setRos} />
        <OperationMode ros={ros} topicName="/operation_mode" />
        <BrushCommand ros={ros} topicName="/brush/command" />
        <WinchLan ros={ros} topicName="/winch/lan/vel" />
        <WinchChild ros={ros} topicName="/winch/child/vel" />
      </header>

      {/* 画像表示エリア */}
      <main className="flex-1 flex items-center justify-center mb-26">
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
            <LidarViewer ros={ros} topicName="/lidar_points" />
          </div>
        </div>
      </main>

      {/* タイマー (フッター) */}
      <footer className="fixed bottom-4 w-full px-4 flex justify-center z-50">
        <TimerBar totalTime={600} />
      </footer>
    </div >
  );
}

export default App;
