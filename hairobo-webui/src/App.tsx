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
      {/* ロゴ削除: フッターへ移動 */}

      {/* 画像表示エリア */}
      <main className="flex-1 flex items-center justify-center mb-20">
        {/* max-w-7xl を削除し、w-full px-6 に変更して画面幅を一杯に使う */}
        <div className="flex items-center gap-6 w-full px-6">
          {/* StatusPanelの幅を確保 */}
          <div className="w-80 shrink-0">
            <StatusPanel ros={ros} setRos={setRos} />
          </div>

          <div className={`grid grid-cols-2 grid-rows-2 gap-6 flex-1 h-[80vh] ${expandedCamera ? 'blur-sm' : ''}`}>
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

          {/* ControlPanelの幅を確保 */}
          <div className="w-80 shrink-0">
            <ControlPanel ros={ros} />
          </div>
        </div>
      </main>

      {/* モーダル表示 */}
      <CameraModal
        cameraType={expandedCamera}
        ros={ros}
        onClose={() => setExpandedCamera(null)}
      />

      {/* タイマー (フッター) + ロゴ */}
      <footer className="fixed bottom-4 w-full px-8 flex items-center justify-between z-50">
        <div className="w-1/2 flex">
          <img src={appIcon} alt="Hairoboアイコン" className="h-16 drop-shadow" />
          <h2 className="text-2xl font-bold text-gray-700 ml-4">Hairobo</h2>
        </div>
        <div className="w-1/2">
          <TimerBar totalTime={600} />
        </div>
      </footer >
    </div >
  );
}

export default App;
