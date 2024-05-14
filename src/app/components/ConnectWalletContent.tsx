'use client';

import Image from 'next/image';
import IconCopy from 'public/images/icons/IconCopy';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Button from './Button';
import { useEffect } from 'react';

interface IConnectWalletContentProps {
	onConnect?: () => void;
}

const ConnectWalletContent = ({ onConnect }: IConnectWalletContentProps) => {
	const { connectors, connectAsync } = useConnect();
	const { address, isConnected } = useAccount();
	const { disconnect } = useDisconnect();
	console.log('Connectors', connectors);

	useEffect(() => {
		if (isConnected) {
			onConnect?.();
		}
	}, [isConnected]);

	return (
		<div className='w-full'>
			<p className='mb-4 border-b border-gray-200 py-4 text-center text-lg font-bold '>
				Connect Wallet
			</p>
			<div className='mt-4 border-b border-gray-200 py-4'>
				{address ? (
					<button onClick={() => disconnect()}>Disconnect</button>
				) : (
					<div className='flex w-full flex-col gap-2'>
						{connectors.map(connector => (
							<div
								className='flex w-full cursor-pointer items-center gap-2 rounded-xl bg-gray-100 p-2 transition-colors duration-200 ease-in-out'
								key={connector.id}
								onClick={() =>
									connectAsync({ connector }).then(() => {
										console.log('Connected to wallet');
										onConnect?.();
									})
								}
							>
								<div className='overflow-hidden rounded-full'>
									{connector.icon &&
									connector.id !== 'walletConnect' ? (
										<Image
											src={connector.icon}
											width={40}
											height={40}
											alt={connector.name}
										/>
									) : (
										<Image
											src='/images/wallets/walletconnect-logo.png'
											width={40}
											height={40}
											alt={connector.name}
										/>
									)}
								</div>
								{connector.name}
							</div>
						))}
					</div>
				)}
			</div>
			<div className='mb-10 flex flex-col gap-4'>
				<p className='mt-4 font-bold'>Don’t want to connect wallet?</p>
				<p className='text-ph'>
					You can still collect voting power from your wallet by
					copying the code and following instructions on the [website]
				</p>
				<div className='flex justify-between rounded-md bg-gray-100 px-4 py-2'>
					<p className='font-bold'>456790</p>
					<div className='cursor-pointer'>
						<IconCopy />
					</div>
				</div>

				<Button
					onClick={onConnect}
					className='border border-gray-200 bg-white text-black shadow-md'
				>
					Collect voting power
				</Button>
				<p className='text-ph'>
					You will be redirected to another page outside the app.
				</p>
			</div>
		</div>
	);
};

export default ConnectWalletContent;
