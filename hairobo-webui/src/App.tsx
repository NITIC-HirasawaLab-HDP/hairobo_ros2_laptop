import { useState } from 'react';
import ROSLIB from 'roslib';
import appIcon from './assets/icon.png';
// カメラ・LiDAR・ROS接続コンポーネントをインポート
import ParentFrontCamera from './components/video/ParentFrontCamera';
import ParentRearCamera from './components/video/ParentRearCamera';
import ChildFrontCamera from './components/video/ChildFrontCamera';
import LidarViewer from './components/video/LidarViewer';
import TimerBar from './components/ui/TimerBar';
import CameraModal from './components/ui/CameraModal';
import ControlPanel from './components/ControlPanel';
import StatusPanel from './components/StatusPanel';

function App() {
  const [ros, setRos] = useState<ROSLIB.Ros | null>(null);
  const [expandedCamera, setExpandedCamera] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-transparent overflow-hidden gap-0">
      <div className="fixed top-4 left-4 z-50 flex items-center">
        <img src={appIcon} alt="Hairoboアイコン" className="h-20 drop-shadow" />
      </div>

      {/* 画像表示エリア */}
      <main className="flex-1 flex items-center justify-center mb-26">
        <div className="flex items-center gap-8 w-[95vw] max-w-7xl">
          <StatusPanel ros={ros} setRos={setRos} />
          <div className={`grid grid-cols-2 grid-rows-2 gap-8 flex-1 h-[80vh] max-h-[960px] ${expandedCamera ? 'blur-sm' : ''}`}>
            <div
              className="w-full h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg border border-gray-300 shadow-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setExpandedCamera('parent-front')}
            >
              <ParentFrontCamera ros={ros} />
            </div>

            <div
              className="w-full h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg border border-gray-300 shadow-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setExpandedCamera('parent-rear')}
            >
              <ParentRearCamera ros={ros} />
            </div>

            <div
              className="w-full h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg border border-gray-300 shadow-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setExpandedCamera('child-front')}
            >
              <ChildFrontCamera ros={ros} />
            </div>

            <div
              className="w-full h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg border border-gray-300 shadow-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setExpandedCamera('lidar')}
            >
              <LidarViewer ros={ros} topicName="/lidar_points" />
            </div>
          </div>

          <ControlPanel />
        </div>
      </main>

      {/* モーダル表示 */}
      <CameraModal
        cameraType={expandedCamera}
        ros={ros}
        onClose={() => setExpandedCamera(null)}
      />

      {/* タイマー (フッター) */}
      <footer className="fixed bottom-4 w-full px-4 flex justify-center z-50">
        <TimerBar totalTime={600} />
      </footer>
    </div >
  );
}

export default App;
