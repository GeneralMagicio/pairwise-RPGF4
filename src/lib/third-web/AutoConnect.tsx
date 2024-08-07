'use client';

import { client, smartWalletConfig } from './provider';
import React, {
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { WalletId, createWallet } from 'thirdweb/wallets';
import { useActiveAccount, useActiveWallet, useConnect } from 'thirdweb/react';
import { LAST_CONNECT_PERSONAL_WALLET_ID, activeChain } from './constants';
import { alreadyInProgress, isLoggedIn, loginToPwBackend } from '@/utils/auth';

export enum LogginToPwBackendState {
	Initial,
	Error,
	LoggedIn,
}

const AuthContext = React.createContext<{
	isAutoConnecting: boolean | null;
	setIsAutoConnecting: (bool: boolean | null) => void;
	loggedToPw: LogginToPwBackendState;
	isNewUser: boolean;
	setLoggedToPw: (bool: LogginToPwBackendState) => void;
	setIsNewUser: (bool: boolean) => void;
}>({
	isAutoConnecting: null,
	setIsAutoConnecting: () => {},
	loggedToPw: LogginToPwBackendState.Initial,
	isNewUser: false,
	setLoggedToPw: () => {},
	setIsNewUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [isAutoConnecting, setIsAutoConnecting] = useState<boolean | null>(
		null,
	);
	const [loggedToPw, setLoggedToPw] = useState(
		LogginToPwBackendState.Initial,
	);
	const [isNewUser, setIsNewUser] = useState(false);

	return (
		<AuthContext.Provider
			value={{
				isAutoConnecting,
				setIsAutoConnecting,
				loggedToPw,
				setLoggedToPw,
				isNewUser,
				setIsNewUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const {
		isAutoConnecting,
		setIsAutoConnecting,
		loggedToPw,
		setLoggedToPw,
		setIsNewUser,
		isNewUser,
	} = useContext(AuthContext);

	const { connect } = useConnect();
	const account = useActiveAccount();
	const wallet = useActiveWallet();

	useEffect(() => {
		const main = async () => {
			try {
				const personalWalletId = localStorage.getItem(
					LAST_CONNECT_PERSONAL_WALLET_ID,
				);
				if (!personalWalletId) return;
				setIsAutoConnecting(true);
				const personalWallet = createWallet(
					personalWalletId as WalletId,
				);
				const personalAccount = await personalWallet.autoConnect({
					client: client,
				});
				const smartWallet = createWallet('smart', smartWalletConfig);
				await smartWallet.connect({ personalAccount, client: client });
				await connect(smartWallet);
			} finally {
				setIsAutoConnecting(false);
			}
		};

		main();
	}, [setIsAutoConnecting, connect]);

	const checkLoginFlow = useCallback(async () => {
		try {
			if (account && wallet) {
				const validToken = await isLoggedIn();
				if (validToken) setLoggedToPw(LogginToPwBackendState.LoggedIn);
				else if (!alreadyInProgress) {
					const res = await loginToPwBackend(
						activeChain.id,
						account.address,
						account.signMessage,
					);
					if (res.isNewUser) {
						setIsNewUser(true);
					}
					setLoggedToPw(LogginToPwBackendState.LoggedIn);
				}
			}
		} catch (e) {
			setLoggedToPw(LogginToPwBackendState.Error);
		}
	}, [account, wallet, setLoggedToPw, setIsNewUser]);

	useEffect(() => {
		checkLoginFlow();
	}, [wallet, isAutoConnecting, checkLoginFlow]);

	return {
		isAutoConnecting,
		setIsAutoConnecting,
		loggedToPw,
		setLoggedToPw,
		setIsNewUser,
		isNewUser,
	};
};
