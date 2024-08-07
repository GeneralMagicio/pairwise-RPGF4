import { axios } from '@/lib/axios';
import { Account } from 'thirdweb/wallets';

axios.interceptors.response.use(
	function (response) {
		return response;
	},
	function (error) {
		if (error.response && error.response.status === 401) {
			logoutFromPwBackend();
		}
		return Promise.reject(error);
	},
);

export const isLoggedIn = async () => {
	if (!localStorage.getItem('auth')) return false;
	try {
		const { data } = await axios.get<Number>('/auth/isloggedin');
		return data;
	} catch (err) {
		return false;
	}
};

// const fetchNonce = async () => {
//   try {
//     const { data } = await axios.get<string>('/auth/nonce')
//     return data
//   } catch (err) {
//     console.error(err)
//   }
// }

// function generateRandomString(length: number): string {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// }

export let alreadyInProgress = false;

export const loginToPwBackend = async (
	chainId: number,
	address: string,
	signFunction: Account['signMessage'],
) => {
	alreadyInProgress = true;
	// const nonce = await fetchNonce()
	// const nonce = generateRandomString(16

	const message = 'Signing in to Pairwise servers';

	const signature = await signFunction({
		message,
	});

	// Verify signature
	const { data } = await axios.post<{ token: string; isNewUser: boolean }>(
		'/auth/login',
		{
			...{ message, signature: `${signature}`, address, chainId },
		},
	);

	const token = data.token;
	window.localStorage.setItem('auth', token);
	window.localStorage.setItem('loggedInAddress', address);
	axios.defaults.headers.common['auth'] = token;

	alreadyInProgress = false;

	return data;
};

export const logoutFromPwBackend = async () => {
	try {
		window.localStorage.removeItem('auth');
		window.localStorage.removeItem('loggedInAddress');
		if (axios.defaults.headers.common['auth']) {
			delete axios.defaults.headers.common['auth'];
		}
		// await axios.post('/auth/logout')
	} catch (err) {
		console.error(err);
	}
};
