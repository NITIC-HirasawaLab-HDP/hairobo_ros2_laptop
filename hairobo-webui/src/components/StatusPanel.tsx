import type { Dispatch, SetStateAction } from 'react';
import ROSLIB from 'roslib';
import RosConnection from './status/RosConnection';
import OperationMode from './status/OperationMode';
import BrushCommand from './status/BrushCommand';
import WinchLan from './status/WinchLan';
import WinchChild from './status/WinchChild';
import Battery from './status/Battery';
import EncoderLeft from './status/Encoder_L'
import EncoderRight from './status/Encoder_R'

type StatusPanelProps = {
	ros: ROSLIB.Ros | null;
	setRos: Dispatch<SetStateAction<ROSLIB.Ros | null>>;
};

function StatusPanel({ ros, setRos }: StatusPanelProps) {
	return (
		<aside className="w-full h-[80vh] max-h-[960px] rounded-2xl bg-slate-50 backdrop-blur-lg border border-gray-300 shadow-lg p-6 flex flex-col items-center gap-6">
			<h2 className="w-full text-xl font-semibold text-gray-700 text-center">Status Panel</h2>
			<div className="w-full flex flex-col justify-center gap-4">
				<RosConnection rosUrl={`ws://${window.location.hostname}:9090`} rosDomainId={89} setRos={setRos} />
				<OperationMode ros={ros} topicName="/operation_mode" />
				<BrushCommand ros={ros} topicName="/brush/command" />
				<WinchLan ros={ros} topicName="/winch/lan/vel" />
				<WinchChild ros={ros} topicName="/winch/child/vel" />
				<Battery ros={ros} />
				<EncoderLeft ros={ros} />
				<EncoderRight ros={ros} />
			</div>
		</aside>
	);
}

export default StatusPanel;
