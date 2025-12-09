import React from 'react';

interface ToggleProps {
	title: string;
	checked?: boolean; // 制御コンポーネント向け
	onChange?: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
	title,
	checked,
	onChange,
	disabled = false,
	className = '',
}) => {
	const isControlled = checked !== undefined;
	const [internalChecked, setInternalChecked] = React.useState<boolean>(
		Boolean(checked)
	);

	// 外部から checked が変わったら同期
	React.useEffect(() => {
		if (isControlled) setInternalChecked(Boolean(checked));
	}, [checked, isControlled]);

	const active = isControlled ? Boolean(checked) : internalChecked;

	const handleToggle = () => {
		if (disabled) return;
		const next = !active;
		if (!isControlled) setInternalChecked(next);
		onChange?.(next);
	};

	return (
		<div className={`bg-white px-1 py-1 rounded-full border border-foreground/10 border-gray-300 shadow-xl flex items-center justify-between gap-3 w-full ${className}`}>
			{/* タイトル */}
			<div className="text-base font-semibold text-foreground pl-1">
				{title}
			</div>

			{/* シンプルなトグル */}
			<button
				type="button"
				role="switch"
				aria-checked={active}
				disabled={disabled}
				onClick={handleToggle}
				className={`relative inline-flex w-11 h-6 items-center rounded-full border border-transparent p-0.5 transition-colors duration-200 focus:outline-none ${active ? 'bg-[#632BDB] justify-end' : 'bg-gray-200 justify-start'
					} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
			>
				{/* ノブ */}
				<span
					className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
				/>
			</button>
		</div>
	);
};

export default Toggle;
