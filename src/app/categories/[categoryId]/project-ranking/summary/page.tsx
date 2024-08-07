'use client';

import CategoryProjectItem from '@/app/categories/components/CategoryProjectItem';
import { InclusionState } from '@/app/categories/types';
import Button from '@/app/components/Button';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import TopNavigation from '@/app/components/TopNavigation';
import { Routes } from '@/app/constants/Routes';
import { useCategoryById } from '@/app/features/categories/getCategoryById';
import { useProjectsByCategoryId } from '@/app/features/categories/getProjectsByCategoryId';
import { useUpdateCategoryMarkFiltered } from '@/app/features/categories/updateCategoryMarkFiltered';
import { useParams, useRouter } from 'next/navigation';
import posthog from 'posthog-js';

const ProjectRankingSummaryPage = () => {
	const router = useRouter();
	const { categoryId } = useParams();

	const selectedCategoryId =
		typeof categoryId === 'string' ? categoryId : categoryId[0];
	const { data: projects, isLoading: isProjectsLoading } =
		useProjectsByCategoryId(+selectedCategoryId);

	const { data, isLoading: isCategoryLoading } =
		useCategoryById(+selectedCategoryId);

	const { mutateAsync: markCategoryFiltered } = useUpdateCategoryMarkFiltered(
		{
			categoryId: +categoryId,
		},
	);

	const selectedCategory = data?.data?.collection;

	const includedProjects = projects?.data.filter(
		project => project.inclusionState === InclusionState.Included,
	);

	const includedProjectsEvents = includedProjects?.map(project => {
		return { id: project.id, name: project.name };
	});

	posthog.capture('Filtered Categories', {
		categories: includedProjectsEvents,
	});

	const excludedProjects = projects?.data.filter(
		project => project.inclusionState === InclusionState.Excluded,
	);

	if (isProjectsLoading || isCategoryLoading) {
		return <LoadingSpinner />;
	}
	return (
		<div className='flex min-h-[calc(100dvh)] flex-col  justify-between'>
			<div>
				<div>
					<TopNavigation
						link={Routes.Categories}
						text={selectedCategory?.name}
					/>
				</div>
				<div className='mx-4'>
					<div className='mb-4 mt-6'>
						<p className='font text-[28px] font-bold leading-[34px]'>
							{includedProjects?.length || 0} out of{' '}
							{projects?.data.length || 0}{' '}
							<span className='text-[#636779]'>
								projects selected
							</span>
						</p>
					</div>
					<p className='mb-6 text-lg font-semibold'>
						{selectedCategory?.name}
					</p>
					<p className='text-lg font-bold'>
						Selected ({includedProjects?.length || 0})
					</p>
					{includedProjects?.map(project => (
						<CategoryProjectItem
							project={project}
							key={project.id}
						/>
					))}
					<div className='mt-6'>
						<p className='mb-2 text-lg font-semibold'>
							Not Selected ({excludedProjects?.length || 0})
						</p>
						{excludedProjects?.map(project => (
							<div key={project.id} className='opacity-40'>
								<CategoryProjectItem
									project={project}
									key={project.id}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className='sticky bottom-0 border-t border-b-gray-200 bg-white px-6 py-6'>
				<div className='flex justify-between gap-4'>
					<Button
						onClick={() =>
							router.push(
								`${Routes.Categories}/${selectedCategory?.id}/project-ranking/edit`,
							)
						}
						className='w-full text-black shadow-md'
					>
						Edit
					</Button>
					<Button
						onClick={async () => {
							await markCategoryFiltered({
								data: { cid: +selectedCategoryId },
							});
							router.push(
								`${Routes.Categories}/${categoryId}/project-ranking/done`,
							);
						}}
						className='w-full bg-primary'
					>
						Finish Filtering
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ProjectRankingSummaryPage;
