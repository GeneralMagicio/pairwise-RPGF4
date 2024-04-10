// In WelcomeLayout component
import Button from "@/app/components/Button";
import React, { ReactNode } from "react";

const IntroLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="centered-mobile-max-width flex flex-col min-h-screen">
      <div className="flex-grow flex flex-col justify-center px-6">
        {children}
      </div>
      <div className="w-full border-t-2 border-gray-200"></div>
      <div className="px-6 py-6">
        <Button className="bg-primary w-full">Let’s go!</Button>
      </div>
    </div>
  );
};

export default IntroLayout;
