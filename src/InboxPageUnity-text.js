import React, { useState, useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { UInbox } from "./UInbox-text";


const InboxPageUnity = () => {

  const [signer, setSigner] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false); // Add state for wallet connection

  //UNITY
  const { unityProvider, addEventListener, removeEventListener } =
  useUnityContext({
    loaderUrl: "Build/FinalVersion.loader.js",
    dataUrl: "Build/FinalVersion.data",
    frameworkUrl: "Build/FinalVersion.framework.js",
    codeUrl: "Build/FinalVersion.wasm",
  });
   
  const getAddress = async (signer) => {
    try {
      return await signer?.getAddress();
    } catch (e) {
      console.log(e);
    }
  };

  const openXMTPChat = useCallback (async (signer1) => {
    
    setSigner(signer1);
    setWalletConnected(true);
    let address = await getAddress(signer1);
    console.log(address);
    localStorage.setItem("walletConnected", JSON.stringify(true)); // Save connection status in local storage
    localStorage.setItem("signerAddress", JSON.stringify(address)); // Save signer address in local storage

    //window.uinbox.open(signer1);
    if(window.uinbox) {
        window.uinbox.open(signer1);
    } else {
        console.warn('uinbox is not defined yet');
    }
      
  });


  useEffect(() => {
    const storedWalletConnected = localStorage.getItem("walletConnected");
    const storedSignerAddress = JSON.parse(
      localStorage.getItem("signerAddress")
    );
    if (storedWalletConnected && storedSignerAddress) {
      setWalletConnected(JSON.parse(storedWalletConnected));
    }
  }, []);

  useEffect(() => {
    addEventListener("OpenXMTP", openXMTPChat);
    return () => {
      removeEventListener("OpenXMTP", openXMTPChat);
    };
  }, [addEventListener, removeEventListener, openXMTPChat]);

  return (
    <>
      <Unity unityProvider={unityProvider} style={{ width: 1300, height: 700 }} />
      
      {/* Include the JSX element directly when 'signer' is available */}
      {signer && walletConnected && <UInbox env={process.env.REACT_APP_XMTP_ENV} wallet={signer} />}
    </>
  );

};

export default InboxPageUnity;

