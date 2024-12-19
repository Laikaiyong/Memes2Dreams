'use client';

import React, { createContext, useState, useContext } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const NetworkContext = createContext();

export function useNetwork() {
  return useContext(NetworkContext);
}

export function NetworkProvider({ children }) {
  const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet);

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}