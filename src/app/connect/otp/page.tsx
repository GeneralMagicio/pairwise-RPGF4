'use client';

import Image from 'next/image';
import { OtpState } from '../components/ConnectOtpInput';
import { useEffect, useState } from 'react';
import Button from '@/app/components/Button';
import { useUpdateOtp } from '@/app/features/user/updateOtp';
import { useRouter } from 'next/navigation';
import { Routes } from '@/app/constants/Routes';
import { useMutation } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import {
	identityLsKey,
	useCreateIdentity,
} from '@/app/hooks/useCreateIdentity';
import axios from 'axios';
import { API_URL } from '@/app/config';
import { BadgeData, badgeTypeMapping } from '@/app/badges/components/BadgeCard';
import { useGetPublicBadges } from '@/app/features/badges/getBadges';
import { AdjacentBadges } from '@/app/badges/components/AdjacentBadges';
import { ConnectErrorBox } from '../components/ConnectErrorBox';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const storeIdentityAndBadges = async ({
	identity,
	mainAddress,
	signature,
	token,
}: {
	identity: string;
	mainAddress: string;
	signature: string;
	token: string;
}) => {
	return axios.post(
		`${API_URL}/user/store-badges-identity`,
		{
			identity,
			mainAddress,
			signature,
		},
		{
			headers: {
				'Content-Type': 'application/json',
				auth: token,
			},
		},
	);
};

const ConnectOTPPage = () => {
	const [otp, setOtp] = useState('');

	const [otpState, setOtpState] = useState<OtpState>(OtpState.Ready);
	const [error, setError] = useState<string | false>(false);
	const { mutateAsync, isPending } = useUpdateOtp();
	const { createIdentity } = useCreateIdentity();
	const { mutateAsync: storeBadgesAndIdentityMutation } = useMutation({
		mutationFn: storeIdentityAndBadges,
	});

	const { address } = useAccount();

	const { data: publicBadges, isLoading: isPublicBadgesLoading } =
		useGetPublicBadges(address || '');

	const { signMessageAsync } = useSignMessage();

	const router = useRouter();

	const numOfBadgesFunc = (publicBadges: BadgeData) =>
		Object.keys(publicBadges).filter(el =>
			Object.keys(badgeTypeMapping).includes(el),
		).length;

	useEffect(() => {
		const currentParams = new URLSearchParams(window.location.search);
		const otp = currentParams.get('otp');
		if (otp) setOtp(otp);
	}, []);

	const handleSubmitOtp = async () => {
		try {
			if (otp) {
				const res = await mutateAsync({ data: { otp } });
				setOtpState(OtpState.Valid);

				const token = res.data;
				const message = `Sign this message to generate your Semaphore identity.`;
				const signature = await signMessageAsync({
					message: message,
				});

				await createIdentity(signature);

				const identity = localStorage.getItem(identityLsKey);

				if (!identity || !address) return;

				await storeBadgesAndIdentityMutation({
					mainAddress: address,
					signature,
					identity,
					token,
				});

				router.push(Routes.ConnectSuccess);
			}
		} catch (error) {
			setOtpState(OtpState.Invalid);
			setError(
				`There's no Pairwise account associated with your link. Please get back to the Mobile App and try a new link.`,
			);
		}
	};

	const disabled = otp.length !== 6 || isPending;

	if (isPublicBadgesLoading) {
		return <LoadingSpinner />;
	}

	if (publicBadges && numOfBadgesFunc(publicBadges) === 0) {
		return (
			<div className='centered-mobile-max-width px-4 py-6 text-center'>
				<div>
					<p className='pb-2 text-3xl font-bold'>Claim badges</p>
					<p className='text-ph'>
						Oh no, this address does not have any badge to claim.
						But no worries, you can still play and vote.
					</p>
				</div>
				<div className='my-2 flex flex-col items-center gap-4'>
					<Image
						src={'/images/characters/12.png'}
						alt='No badges character'
						height={160}
						width={160}
					/>
					<p className='mb-4 text-primary'>No Badges found</p>
				</div>
				<Button
					onClick={handleSubmitOtp}
					className={`mt-6 w-full ${!disabled ? 'bg-primary' : 'cursor-not-allowed bg-gray-200'}`}
					disabled={disabled}
				>
					Connect Anyway
				</Button>
				<div className='w-full pt-2'>
					{error && <ConnectErrorBox message={error} />}
				</div>
			</div>
		);
	}

	return (
		<div className='centered-mobile-max-width'>
			<div className='text-center'>
				<Image
					src={'/images/characters/7.png'}
					width={220}
					height={100}
					alt='logo'
					className='mx-auto'
				/>
			</div>
			<div className='mt-6'>
				<p className='text-center text-2xl font-medium'>Claim Badges</p>
				<p className='pt-2 text-center text-ph'>
					Claim your badges to start voting on projects.
				</p>
				<p className='py-4 text-center text-ph'>
					{publicBadges &&
						`${numOfBadgesFunc(publicBadges)} ${numOfBadgesFunc(publicBadges) === 1 ? 'Badge' : 'Badges'} found`}
				</p>
				<AdjacentBadges {...publicBadges} size={86} />
				<Button
					onClick={handleSubmitOtp}
					className={`mt-6 w-full ${!disabled ? 'bg-primary' : 'cursor-not-allowed bg-gray-200'}`}
					disabled={disabled}
				>
					Connect
				</Button>
				<div className='w-full pt-2'>
					{error && <ConnectErrorBox message={error} />}
				</div>{' '}
			</div>
		</div>
	);
};

export default ConnectOTPPage;
