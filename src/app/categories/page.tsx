'use client';

import React, { useEffect, useState } from 'react';
import CategoryItem from './components/CategoryItem';
import { useCategories } from '../features/categories/getCategories';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGetCategoryPairs } from '../features/categories/getCategoryPairs';
import { CategoryPairwiseModal } from '../category-ranking/components/CategoryPairwiseModal';
import { useRouter } from 'next/navigation';

const CategoriesPage = () => {
	const [isModalOpen, setModalOpen] = useState(false);
	const { data: categories, isLoading } = useCategories();
	const { data: categoryPairs, isLoading: isGettingCategoryPairs } =
		useGetCategoryPairs();
	const router = useRouter();

	useEffect(() => {
		const bool = categoryPairs && categoryPairs.length > 0;
		setModalOpen(bool || false);
	}, [categoryPairs]);

	const closeModal = () => setModalOpen(false);

	const handleSubmit = () => router.push('/category-ranking');

	if (isLoading) {
		return <LoadingSpinner />;
	}
	return (
		<div className='px-4'>
			<CategoryPairwiseModal
				isOpen={isModalOpen}
				close={closeModal}
				handleSubmit={handleSubmit}
			/>
			<h1 className='mt-6 text-2xl font-bold'>Categories</h1>
			<p className='mb-6 text-ph '>Select one to begin ranking</p>
			{categories?.data?.map((category, index) => (
				<CategoryItem
					key={category.id}
					category={category}
					imageNumber={(index % 5) + 1}
				/>
			))}
			<div className='flex  justify-end border-b border-gray-300 bg-white pt-4'>
				<div></div>
				<a target="_blank" href='https://github.com/GeneralMagicio/pairwise-RPGF4/issues/new?assignees=MoeNick&labels=bug&projects=&template=bug_report.md&title=%5BBUG%5D+'>
				<button className='right rounded-full  bg-primary px-4 py-2 text-sm text-white'>
				Report a Bug
				</button>
			</a>
			</div>
			
		</div>
	);
};

export default CategoriesPage;
