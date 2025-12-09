import React from 'react';

interface StatusProps {
	title: string;
	value: React.ReactNode;
	valueClassName?: string; //追加のtailwindcssクラス
}

const Status: React.FC<StatusProps> = ({ title, value, valueClassName }) => {
	return (
		<div className="bg-white px-1 py-1 rounded-full border border-foreground/10 border-gray-300 shadow-xl flex items-center justify-between gap-3">
			<div className="text-base font-semibold text-foreground pl-2">
				{title}
			</div>
			<div className={`border border-foreground/15 border-gray-300 rounded-full px-2 py-0 ${valueClassName || 'bg-background/20'}`}>
				<div className="text-base font-semibold text-foreground">
					{value}
				</div>
			</div>
		</div>
	);
};

export default Status;
