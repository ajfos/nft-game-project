import React, { useEffect, useState } from 'react';
import './App.css';
import SelectCharacter from './SelectCharacter';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import { contractAddress, transformCharacterData } from './constants';
import Arena from './Arena';
import LoadingIndicator from './LoadingIndicator';

const App = () => {


   /*
   * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
   */
   const [currentAccount, setCurrentAccount] = useState(null);
   const [characterNFT, setCharacterNFT] = useState(null);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        contractAddress,
        myEpicGame.abi,
        signer
      );
  
      const characterNFT = await gameContract.checkIfUserHasNFT();
      if (characterNFT.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(characterNFT));
      }
  
      /*
       * Once we are done with all the fetching, set loading state to false
       */
      setIsLoading(false);
    };
  
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

   /*
    * Since this method will take some time, make sure to declare it as async
    */
   const checkIfWalletIsConnected = async () => {
     try {
       const { ethereum } = window;
 
       if (!ethereum) {
         console.log('Make sure you have MetaMask!');
         return;
       } else {
         console.log('We have the ethereum object', ethereum);
 
         /*
          * Check if we're authorized to access the user's wallet
          */
         const accounts = await ethereum.request({ method: 'eth_accounts' });
 
         /*
          * User can have multiple authorized accounts, we grab the first one if its there!
          */
         if (accounts.length !== 0) {
           const account = accounts[0];
           console.log('Found an authorized account:', account);
           setCurrentAccount(account);
         } else {
           console.log('No authorized account found');
         }
       }
     } catch (error) {
       console.log(error);
     }
   };

   /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
 
   useEffect(() => {
     checkIfWalletIsConnected();
   }, []);

   useEffect(() => {
    /*
     * The function we will call that interacts with out smart contract
     */
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        contractAddress,
        myEpicGame.abi,
        signer
      );
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found!');
      }
    };
  
    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  const renderContent = () => {

    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
            alt="Monty Python Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;	
      /*
      * If there is a connected wallet and characterNFT, it's time to battle!
      */
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
    }
  }; 

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
        </div>
        <div className="connect-wallet-container">
          <img
            src="https://media3.giphy.com/media/mDEWYG76hRNV6/giphy.gif"
            alt="Monty Python Gif"
          />
          <div>
          {renderContent()}
            </div>
        </div>
        </div>
    </div>
  );
};

export default App;