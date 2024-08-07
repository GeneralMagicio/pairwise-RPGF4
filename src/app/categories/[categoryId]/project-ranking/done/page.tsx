'use client';

import Button from '@/app/components/Button';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Routes } from '@/app/constants/Routes';
import { useCategoryById } from '@/app/features/categories/getCategoryById';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

const ProjectRankingDonePage = () => {
	const router = useRouter();
	const { categoryId } = useParams();

	const selectedCategoryId =
		typeof categoryId === 'string' ? categoryId : categoryId[0];

	const { data, isLoading: isCategoryLoading } =
		useCategoryById(+selectedCategoryId);
	const selectedCategoryProgress = data?.data?.progress;
	console.log('Selected Category', selectedCategoryProgress);

	if (isCategoryLoading) {
		return <LoadingSpinner />;
	}

	return (
		<div className='flex min-h-[calc(100dvh)] flex-col justify-between'>
			<div className='mx-auto flex h-[80vh] flex-col items-center justify-center gap-4'>
				<Image
					src='/images/characters/ranking-done-character.png'
					alt='Ranking Done'
					width={250}
					height={250}
				/>
				<p className='mx-auto text-[28px] font-bold'>
					Fantastic job filtering
				</p>
				<p className='mx-auto text-ph'>
					{' '}
					Now let&apos;s find out which projects come out on top!
				</p>
			</div>
			<div className='border-t border-t-gray-300 px-6 py-6'>
				<Button
					onClick={() => {
						// if (
						// 	selectedCategoryProgress === 'Filtering' &&
						// 	currentIndex === -1
						// ) {
						// 	updateCategoryMarkFiltered.mutate({
						// 		data: {
						// 			cid: +selectedCategoryId,
						// 		},
						// 	});
						// }
						router.push(
							`${Routes.Categories}/${categoryId}/pairwise-ranking`,
						);
					}}
					// disabled={updateCategoryMarkFiltered.isPending}
					className='w-full bg-primary'
				>
					Start Ranking
				</Button>
			</div>
		</div>
	);
};

export default ProjectRankingDonePage;
