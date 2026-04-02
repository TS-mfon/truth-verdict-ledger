import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  isMetaMaskInstalled as checkMetaMask,
  connectMetaMask,
  switchAccount as switchAccountFn,
  getAccounts,
  isOnGenLayerNetwork,
  getEthereumProvider,
} from "./client";

const DISCONNECT_FLAG = "wallet_disconnected";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isMetaMaskInstalled: boolean;
  isOnCorrectNetwork: boolean;
}

interface WalletContextValue extends WalletState {
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
  switchWalletAccount: () => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isLoading: true,
    isMetaMaskInstalled: false,
    isOnCorrectNetwork: false,
  });

  const updateState = useCallback(async () => {
    const installed = checkMetaMask();
    if (!installed) {
      setState({ address: null, isConnected: false, isLoading: false, isMetaMaskInstalled: false, isOnCorrectNetwork: false });
      return;
    }
    const disconnected = localStorage.getItem(DISCONNECT_FLAG) === "true";
    if (disconnected) {
      setState({ address: null, isConnected: false, isLoading: false, isMetaMaskInstalled: true, isOnCorrectNetwork: false });
      return;
    }
    const accounts = await getAccounts();
    const onNetwork = await isOnGenLayerNetwork();
    const address = accounts[0] || null;
    setState({
      address,
      isConnected: !!address,
      isLoading: false,
      isMetaMaskInstalled: true,
      isOnCorrectNetwork: onNetwork,
    });
  }, []);

  useEffect(() => {
    updateState();
    const provider = getEthereumProvider();
    if (!provider) return;
    const handleAccounts = () => updateState();
    const handleChain = () => updateState();
    provider.on("accountsChanged", handleAccounts);
    provider.on("chainChanged", handleChain);
    return () => {
      provider.removeListener("accountsChanged", handleAccounts);
      provider.removeListener("chainChanged", handleChain);
    };
  }, [updateState]);

  const connectWallet = useCallback(async () => {
    localStorage.removeItem(DISCONNECT_FLAG);
    const address = await connectMetaMask();
    await updateState();
    return address;
  }, [updateState]);

  const disconnectWallet = useCallback(() => {
    localStorage.setItem(DISCONNECT_FLAG, "true");
    setState(prev => ({ ...prev, address: null, isConnected: false }));
  }, []);

  const switchWalletAccount = useCallback(async () => {
    const address = await switchAccountFn();
    await updateState();
    return address;
  }, [updateState]);

  return (
    <WalletContext.Provider value={{ ...state, connectWallet, disconnectWallet, switchWalletAccount }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
