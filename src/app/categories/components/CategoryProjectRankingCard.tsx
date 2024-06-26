import Image from 'next/image';
import { IProject } from '../types';
import { truncate } from '@/app/helpers/text-helpers';
import { useState } from 'react';
import Drawer from '@/app/components/Drawer';
import CategoriesProjectDrawerContent from './CategoriesProjectDrawerContent';
import { motion } from 'framer-motion';
import IconEye from 'public/images/icons/IconEye';

interface ICategoryProjectRankingCardProps {
	project: IProject;
	hasSeenProjectDetails: boolean;
	setHasSeenProjectDetails: (value: boolean) => void;
}

const CategoryProjectRankingCard = ({
	project,
	hasSeenProjectDetails,
	setHasSeenProjectDetails,
}: ICategoryProjectRankingCardProps) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const variants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				duration: 0.5,
			},
		},
		exit: {
			opacity: 0,
			transition: {
				duration: 0.5,
			},
		},
	};
	console.log('project', project);
	return (
		<motion.div
			initial='hidden'
			animate='show'
			exit='exit'
			variants={variants}
		>
			<div className='w-[324px] select-none rounded-2xl px-3 pb-5 shadow-lg'>
				<div className='relative mb-4'>
					{project.image ? (
						<Image
							src={project.image}
							alt={project.name}
							width={300}
							height={300}
							className='rounded-2xl'
						/>
					) : (
						<div className='relative h-[300px] w-[300px] rounded-2xl bg-gray-700'>
							<p className='absolute inset-0 flex items-center justify-center overflow-hidden px-1 text-center text-lg font-bold text-white'>
								{project.name}
							</p>
						</div>
					)}

					<div
						className='absolute bottom-[-20px] right-0 rounded-full bg-red-500 p-4'
						onClick={() => {
							setHasSeenProjectDetails(true);
							setIsDrawerOpen(true);
						}}
					>
						<IconEye />
					</div>
				</div>
				<div className='flex justify-between'>
					<p className='mb-4 font-bold'>{project.name}</p>
				</div>
				<p className='text-ph'>
					{truncate(project.impactDescription, 90)}
				</p>
				<Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen}>
					<CategoriesProjectDrawerContent project={project} />
				</Drawer>
			</div>
		</motion.div>
	);
};

export default CategoryProjectRankingCard;
