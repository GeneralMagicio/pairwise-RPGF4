'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Routes } from '@/app/constants/Routes';
import Button from '@/app/components/Button';
import IconTrash from 'public/images/icons/IconTrash';
import IconCheck from 'public/images/icons/IconCheck';
import IconRefresh from 'public/images/icons/IconRefresh';
import ProgressBar from '@/app/components/ProgressBar';
import { useCategoryById } from '@/app/features/categories/getCategoryById';
import { useProjectsByCategoryId } from '@/app/features/categories/getProjectsByCategoryId';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { InclusionState } from '../../types';
import { useUpdateProjectInclusion } from '@/app/features/categories/updateProjectInclusion';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import CategoryProjectRankingCardWithMetrics from '../../components/CategoryProjectRankingCardWithMetrics';
import { MinimumIncludedProjectsModal } from '@/app/components/MinimumIncludedProjectsModal';
import { MinimumModalState } from '@/utils/types';

interface ErrorResponse {
	response?: {
		data?: {
			pwCode?: string | undefined;
			minimum?: number;
		};
	};
}

const ProjectRankingPage = () => {
	const router = useRouter();
	const { categoryId } = useParams();
	const updateProjectInclusion = useUpdateProjectInclusion({
		categoryId: +categoryId,
	});

	const [minimumModal, setMinimumModal] = useState<MinimumModalState>(
		MinimumModalState.False,
	);

	const selectedCategoryId =
		typeof categoryId === 'string' ? categoryId : categoryId[0];

	const {
		data: projects,
		isLoading: isProjectsLoading,
		isFetching: isProjectsFetching,
	} = useProjectsByCategoryId(+selectedCategoryId);

	const { data, isLoading: isCategoryLoading } =
		useCategoryById(+selectedCategoryId);
	const selectedCategory = data?.data?.collection;

	const projectsCount = projects?.data ? projects?.data.length : 0;

	const includedProjectsCount =
		projects?.data.reduce((count, project) => {
			return project.inclusionState === InclusionState.Included
				? count + 1
				: count;
		}, 0) ?? 0;

	const minimumProjects = projectsCount ? Math.ceil(projectsCount * 0.21) : 2;

	const isMinGreater: boolean = includedProjectsCount >= minimumProjects;

	const backendCurrentIndex: number =
		projects?.data.findIndex(
			project => project.inclusionState === InclusionState.Pending,
		) || 0;

	const [currentIndex, setCurrentIndex] = useState(backendCurrentIndex);

	const updatingProject =
		isProjectsFetching || updateProjectInclusion.isPending;

	const isLastProjectInTheList = currentIndex === projectsCount - 1;
	console.log('isLastProjectInTheList', isLastProjectInTheList);

	const handleProjectInclusion = (state: InclusionState) => {
		updateProjectInclusion
			.mutateAsync({
				data: {
					state,
					id: projects?.data[currentIndex]?.id!,
				},
			})
			.then(() => {
				if (!isLastProjectInTheList) {
					setCurrentIndex(curr => curr + 1);
				}
			})
			.then(() => {
				// Scroll to the top of the page after filtering
				window.scrollTo({ top: 0, behavior: 'smooth' });
			});
	};

	// Function to handle revisiting previous votes
	const handleGoBack = () => {
		if (currentIndex > 0) {
			setCurrentIndex(curr => curr - 1);
		}
	};

	const isRevertDisabled = updatingProject || currentIndex === 0;

	const variants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
	};

	useEffect(() => {
		if (backendCurrentIndex === -1) {
			router.push(
				`${Routes.Categories}/${categoryId}/project-ranking/summary`,
			);
		}
	}, [backendCurrentIndex, router, categoryId]);

	useEffect(() => {
		const errorResponse = updateProjectInclusion.error as ErrorResponse;
		const pwCode = errorResponse?.response?.data?.pwCode;

		if (
			minimumModal === MinimumModalState.False &&
			updateProjectInclusion &&
			pwCode === 'pw1000'
		) {
			setMinimumModal(MinimumModalState.True);
		}
	}, [updateProjectInclusion, minimumModal]);

	useEffect(() => {
		setCurrentIndex(backendCurrentIndex);
	}, [backendCurrentIndex]);

	if (
		isCategoryLoading ||
		isProjectsLoading ||
		backendCurrentIndex === -1 ||
		!projects?.data
	) {
		return <LoadingSpinner />;
	}
	return (
		<div>
			<MinimumIncludedProjectsModal
				close={() => setMinimumModal(MinimumModalState.Shown)}
				isOpen={minimumModal === MinimumModalState.True}
				// @ts-ignore
				minimum={
					(updateProjectInclusion?.error as ErrorResponse)?.response
						?.data?.minimum || 2
				}
			/>
			<div className='flex min-h-[calc(100dvh)] flex-col justify-between'>
				<div>
					<div className='border-b border-b-gray-200 pb-7 pt-9'>
						<div className='mx-4 flex justify-between gap-6'>
							<p>{selectedCategory?.name}</p>
							<Link href={`${Routes.Categories}/${categoryId}`}>
								✕
							</Link>
						</div>
					</div>
					<div className='border-b border-b-gray-200 pb-7'>
						<div className='mx-8 mt-6'>
							<ProgressBar
								progress={
									((backendCurrentIndex + 1) /
										projectsCount) *
									100
								}
								isMinGreater={isMinGreater}
							/>
							<p className='mt-2 text-sm'>
								{backendCurrentIndex + 1} of {projectsCount}{' '}
								Projects Selected
							</p>
						</div>
					</div>
					<AnimatePresence mode='wait'>
						<motion.div
							key={currentIndex}
							initial='hidden'
							animate='visible'
							exit='hidden'
						>
							<div className='flex justify-center border-b  border-b-gray-200'>
								<CategoryProjectRankingCardWithMetrics
									project={projects?.data[currentIndex]!}
								/>
							</div>
						</motion.div>
					</AnimatePresence>
				</div>
				<div className='bg-red sticky bottom-0 w-full border-t border-gray-200 bg-white py-4'>
					<div className='mb-3 flex justify-center gap-14 px-6'>
						<Button
							disabled={updatingProject}
							onClick={() => {
								setMinimumModal(MinimumModalState.False);
								handleProjectInclusion(InclusionState.Excluded);
							}}
							className={`rounded-full p-4 ${updatingProject ? 'cursor-not-allowed bg-red-200' : 'bg-red-500'}`}
						>
							<IconTrash />
						</Button>
						<Button
							disabled={isRevertDisabled}
							className={`rounded-full p-4 ${isRevertDisabled && 'cursor-not-allowed '}`}
							onClick={() => {
								handleGoBack();
							}}
						>
							<IconRefresh />
						</Button>
						<Button
							disabled={updatingProject}
							className={`rounded-full p-4 ${updatingProject ? 'cursor-not-allowed bg-green-200' : 'bg-green-600'}`}
							onClick={() => {
								setMinimumModal(MinimumModalState.False);
								handleProjectInclusion(InclusionState.Included);
							}}
						>
							<IconCheck />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProjectRankingPage;
