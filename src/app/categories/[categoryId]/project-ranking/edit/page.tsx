'use client';

import CategoryEditProjectItem, {
	SelectionState,
} from '@/app/categories/components/CategoryEditProjectItem';
import { InclusionState, IProject } from '@/app/categories/types';
import Button from '@/app/components/Button';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import TopNavigation from '@/app/components/TopNavigation';
import { Routes } from '@/app/constants/Routes';
import { useCategoryById } from '@/app/features/categories/getCategoryById';
import { useProjectsByCategoryId } from '@/app/features/categories/getProjectsByCategoryId';
import { useUpdateProjectInclusionBulk } from '@/app/features/categories/updateProjectInclusionBulk';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MinimumIncludedProjectsModal } from '@/app/components/MinimumIncludedProjectsModal';
import { MinimumModalState } from '@/utils/types';

const ProjectRankingEditPage = () => {
	const router = useRouter();
	const { categoryId } = useParams();

	const [includedProjects, setIncludedProjects] = useState<IProject[]>([]);
	const [excludedProjects, setExcludedProjects] = useState<IProject[]>([]);
	const [hasChanges, setHasChanges] = useState(false);

	const [minimumModal, setMinimumModal] = useState<MinimumModalState>(
		MinimumModalState.False,
	);

	const selectedCategoryId =
		typeof categoryId === 'string' ? categoryId : categoryId[0];
	const { data: projects, isLoading: isProjectsLoading } =
		useProjectsByCategoryId(+selectedCategoryId);

	const { data, isLoading: isCategoryLoading } =
		useCategoryById(+selectedCategoryId);

	const {
		mutateAsync,
		error,
		isPending: isUpdatingPending,
	} = useUpdateProjectInclusionBulk({
		categoryId: +selectedCategoryId,
	});

	const selectedCategory = data?.data?.collection;

	const handleAddToIncluded = (projectId: number) => {
		const project = projects?.data.find(
			project => project.id === projectId,
		);
		if (project) {
			project.inclusionState = InclusionState.Included;
			setIncludedProjects(prevProjects => [...prevProjects, project]);
			setExcludedProjects(prevProjects =>
				prevProjects.filter(p => p.id !== projectId),
			);
			setHasChanges(true);
		}
	};

	const handleRemoveFromIncluded = (projectId: number) => {
		const project = projects?.data.find(
			project => project.id === projectId,
		);
		if (project) {
			project.inclusionState = InclusionState.Excluded;
			setExcludedProjects(prevProjects => [...prevProjects, project]);
			setIncludedProjects(prevProjects =>
				prevProjects.filter(p => p.id !== projectId),
			);
			setHasChanges(true);
		}
		console.log('includedProjects', includedProjects);
	};

	const handleSubmit = async () => {
		setMinimumModal(MinimumModalState.False);
		try {
			const includedProjectIds = includedProjects.map(
				project => project.id,
			);
			//Send includedProjectIds to backend
			await mutateAsync({
				data: {
					state: InclusionState.Included,
					ids: includedProjectIds,
					collectionId: +selectedCategoryId,
				},
			});
			router.push(
				`${Routes.Categories}/${selectedCategoryId}/project-ranking/summary`,
			);
		} catch (error) {
			console.log('Error', error);
		}
	};

	useEffect(() => {
		setIncludedProjects(
			projects?.data.filter(
				project => project.inclusionState === InclusionState.Included,
			) || [],
		);
		setExcludedProjects(
			projects?.data.filter(
				project => project.inclusionState === InclusionState.Excluded,
			) || [],
		);
	}, [projects]);

	useEffect(() => {
		if (
			minimumModal === MinimumModalState.False &&
			error &&
			// @ts-ignore
			error.response &&
			// @ts-ignore
			error.response.data
		) {
			// @ts-ignore
			const errorResponse = error.response.data;
			if (errorResponse.pwCode === 'pw1000') {
				setMinimumModal(MinimumModalState.True);
			}
		}
	}, [error, minimumModal]);

	if (isProjectsLoading || isCategoryLoading) {
		return <LoadingSpinner />;
	}
	return (
		<div className='flex min-h-[calc(100dvh)] flex-col  justify-between'>
			<MinimumIncludedProjectsModal
				close={() => setMinimumModal(MinimumModalState.Shown)}
				isOpen={minimumModal === MinimumModalState.True}
				// @ts-ignore
				minimum={error?.response?.data.minimum || 2}
			/>
			<div>
				<div>
					<TopNavigation
						link={Routes.Categories}
						text={selectedCategory?.name}
					/>
				</div>
				<div className='mx-4'>
					<div className='mb-4 mt-6'>
						<p className='font text-2xl font-bold'>
							{includedProjects?.length || 0} out of{' '}
							{projects?.data.length || 0} projects selected
						</p>
					</div>
					<p className='mb-6 text-lg'>{selectedCategory?.name}</p>
					<p className='text-lg font-semibold'>
						Selected ({includedProjects?.length || 0})
					</p>
					{includedProjects?.map(project => (
						<CategoryEditProjectItem
							project={project}
							key={project.id}
							selectionState={SelectionState.SELECTED}
							handleEditProject={handleRemoveFromIncluded}
						/>
					))}
					<div className='mt-6'>
						<p className='mb-2 text-lg font-semibold'>
							Not Selected ({excludedProjects?.length || 0})
						</p>
						{excludedProjects?.map(project => (
							<div key={project.id}>
								<CategoryEditProjectItem
									project={project}
									key={project.id}
									selectionState={SelectionState.NOT_SELECTED}
									handleEditProject={handleAddToIncluded}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className='sticky bottom-0 border-t border-b-gray-200 bg-white px-6 py-6'>
				<div className='flex justify-between gap-4'>
					<Button
						onClick={() => {
							setMinimumModal(MinimumModalState.False);
							router.push(
								`${Routes.Categories}/${selectedCategory?.id}/project-ranking/summary`,
							);
						}}
						className='w-full text-black  shadow-md'
					>
						Discard
					</Button>
					<Button
						onClick={handleSubmit}
						className={`w-full bg-primary ${!hasChanges || isUpdatingPending ? 'cursor-not-allowed opacity-50' : ''}`}
						disabled={!hasChanges || isUpdatingPending} // Disable button if no changes or update is pending
					>
						Save Changes
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ProjectRankingEditPage;
