import PowerButton from './controls/power';

function ControlPanel() {
	return (
		<aside className="w-64 h-[80vh] max-h-[960px] rounded-2xl bg-white/80 backdrop-blur-lg border border-gray-300 shadow-lg p-6 flex flex-col items-center gap-6">
			<h2 className="text-xl font-semibold text-gray-700 text-center">Control Panel</h2>
			<div className="w-full flex justify-center gap-4">
				<PowerButton />
			</div>
		</aside>
	);
}

export default ControlPanel;
