import React from 'react';

interface StatusProps {
	title: string;
	value: React.ReactNode;
	valueClassName?: string;
}

const Status: React.FC<StatusProps> = ({ title, value, valueClassName }) => {
	return (
		<div className="bg-background/10 backdrop-blur-md px-1 py-1 rounded-full border border-foreground/10 border-gray-300 shadow-xl flex items-center justify-center gap-3">
			<div className="text-base font-semibold text-foreground pl-3">
				{title}
			</div>
			<div className={`backdrop-blur-sm border border-foreground/15 border-gray-300 rounded-full px-3 py-1 ${valueClassName || 'bg-background/20'}`}>
				<div className="text-base font-semibold text-foreground">
					{value}
				</div>
			</div>
		</div>
	);
};

export default Status;
