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
      <footer className="fixed bottom-4 w-full px-6 flex items-center justify-between z-50">
        <div className="w-1/2 flex items-center justify-center">
          <div className="flex items-center">
            <img src={appIcon} alt="Hairoboアイコン" className="h-24 drop-shadow" />
            <div className="ml-4 flex flex-col">
              <p className="text-xl font-bold text-[#632BDB]">HirasawaLAB. Hairo Decommitioning Project</p>
              <div className="flex">
                <p className="text-6xl font-bold text-[#632BDB] leading-none">SHIHO</p>
                <p className="text-sm text-[#632BDB] self-end">UMBILICAL SERIES V2.0.0</p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/2">
          <TimerBar totalTime={600} />
        </div>
      </footer >
    </div >
  );
}

export default App;
