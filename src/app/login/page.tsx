"use client"

import { createSmartWallet } from "@/lib/third-web/methods";
import { client } from "@/lib/third-web/provider";
import Head from "next/head";
import Image from "next/image";
import { useActiveAccount, useActiveWallet, useConnect, useDisconnect } from "thirdweb/react";
import { inAppWallet, preAuthenticate } from "thirdweb/wallets/in-app";

export default function Home() {

  const disconnectWallet = useDisconnect();
  const {connect} = useConnect()

  const wallet = useActiveWallet()
  const account = useActiveAccount()

  const preLogin = async (email: string) => {
    // send email verification code
    await preAuthenticate({
      client,
      strategy: "email",
      email,
    });
  };
   
  const handleLogin = async (email: string, verificationCode: string) => {
    // verify email and connect
    await connect(async () => {
      const wallet = inAppWallet();
      await wallet.connect({
        client,
        strategy: "email",
        email,
        verificationCode,
      });
      return wallet;
    });
  };
  
  const handleGoogleConnect = () => {
    connect(() => createSmartWallet("google"))
  }

  const handleAppleConnect = () => {
    connect(() => createSmartWallet("apple"))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Login Page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <Image
          src="/images/impact-profit.png" // Replace with the path to your character image
          alt="Impact = Profit"
          width={330} // Adjust size accordingly
          height={330}
        />
        <div className="mt-8 flex flex-col gap-4">
          <button onClick={handleGoogleConnect} className="flex gap-2 text-black bg-white w-full p-3 rounded-md shadow-sm">
            <Image src="/images/google.png" alt="Google Icon" width={25} height={25} /> Continue with
            Google
          </button>
          <button onClick={handleAppleConnect} className="flex gap-2 text-black bg-white w-full p-3 rounded-md shadow-sm">
          <Image src="/images/apple.png" alt="Apple Icon" width={25} height={25} />  Continue with Apple
          </button>
          <button onClick={() => preLogin("mghfcp2023@gmail.com")} className="flex gap-2 text-black bg-white w-full p-3 rounded-md shadow-sm">
          <Image src="/images/mail-01.png" alt="Mail" width={25} height={25} />  Sign in with Email
          </button>
        </div>
        <p className="mt-6">
          Don’t have an account?{" "}
          <a href="#" className="text-blue-600">
            Sign up
          </a>
        </p>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <a
          className="flex items-center justify-center"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Pairwise
        </a>
      </footer>
    </div>
  );
}
