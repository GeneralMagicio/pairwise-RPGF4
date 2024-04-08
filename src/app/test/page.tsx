"use client";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { createWallet, embeddedWallet } from "thirdweb/wallets";

const wallets = [embeddedWallet(), createWallet("io.metamask")];

const TestPage = () => {
  const clientId = "ab996cc033833508e203e80eecca234f";
  const client = createThirdwebClient({ clientId });
  console.log("client", client);
  return (
    <div>
      <ConnectButton client={client} wallets={wallets} />
    </div>
  );
};

export default TestPage;
