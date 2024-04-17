import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TanstackProvider from './providers/TanstackProvider';
import WagmiAppProvider from './providers/WagmiAppProvider';
import './globals.css';
import './globals.css';
import { Thirdweb5Provider } from '@/lib/third-web/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Create Next App',
	description: 'Generated by create next app',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<WagmiAppProvider>
					<TanstackProvider>
						<Thirdweb5Provider>
							<div>{children}</div>
						</Thirdweb5Provider>
					</TanstackProvider>
				</WagmiAppProvider>
			</body>
		</html>
	);
}
