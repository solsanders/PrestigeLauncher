import React, { useEffect, useState, useCallback } from 'react';
import TokenFactoryArtifact from './artifacts/contracts/TokenFactory.sol/TokenFactory.json';
import './App.css'; 
import TokenPriceTracker from './TokenPriceTracker';
const ethers = require("ethers");

const TokenFactory = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [initialSupply, setInitialSupply] = useState('');
    const [error, setError] = useState('');
    const [owner, setOwner] = useState('');
    const [newTokenAddress, setNewTokenAddress] = useState(''); 
    const [userTokenBalance, setUserTokenBalance] = useState(''); 
    const [contractBalance, setContractBalance] = useState('0'); 
	const [isLoading, setIsLoading] = useState(false); 
	const [agcBalance, setAgcBalance] = useState('');  
	const [tokenImageUrl, setTokenImageUrl] = useState('');
    const [uploadedImage, setUploadedImage] = useState('');
	const [projectDescription, setProjectDescription] = useState('');





    useEffect(() => {
        const handleChainChanged = (chainId) => {
            window.location.reload();
        };

        window.ethereum && window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum && window.ethereum.removeListener('chainChanged', handleChainChanged);
        };
    }, []);

    const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            console.log("Connecting to wallet...");
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts.length === 0) {
                throw new Error('No accounts found. Please make sure MetaMask is unlocked.');
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const account = await signer.getAddress();
            setAccount(account);

            
            const balance = await provider.getBalance(account);   
            const formattedBalance = ethers.formatUnits(balance, 18);  
            setAgcBalance(formattedBalance); 

            const tokenFactoryAddress = '0x5CE6E2C5BCfF321Da9A7d11D7884153b1dDA9a92'; 
            const tokenFactoryContract = new ethers.Contract(tokenFactoryAddress, TokenFactoryArtifact.abi, signer);
            
            setContract(tokenFactoryContract);

            const ownerAddress = await tokenFactoryContract.owner();
            setOwner(ownerAddress);

            console.log("Wallet connected:", account);
        } catch (error) {
            console.error("Error connecting to wallet:", error.message);
            setError("Failed to connect to wallet: " + error.message);
        }
    } else {
        alert("MetaMask not detected. Please install MetaMask.");
        console.error("MetaMask not detected.");
    }
};



    const createToken = async () => {
        if (!contract) {
        console.error("Contract not found");
        setError("Contract not found. Please connect your wallet.");
        return;
        }
  
        try {
        setIsLoading(true);
        const supply = ethers.parseUnits(initialSupply.toString(), 18);
        const tx = await contract.createToken(tokenName, tokenSymbol, supply, {
            value: ethers.parseUnits("10", 18),
        });
        const receipt = await tx.wait();
        const parsedLogs = receipt.logs.map(log => {
            try {
            return contract.interface.parseLog(log);
            } catch (e) {
            return null;
            }
        }).filter(log => log !== null);
  
    const tokenCreatedEvent = parsedLogs.find(log => log.name === 'TokenCreated');
        if (tokenCreatedEvent) {
        const tokenAddress = tokenCreatedEvent.args.tokenAddress;
        setNewTokenAddress(tokenAddress);

        await checkTokenBalance(tokenAddress, account);
      }
      await refreshBalance();
    } catch (error) {
      console.error("Error creating token:", error);
    } finally {
      setIsLoading(false);
    }
  };
  


  const refreshBalance = useCallback(async () => {
        if (account) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const balance = await provider.getBalance(account);
                const formattedBalance = ethers.formatUnits(balance, 18);
                console.log("Updated AGC balance:", formattedBalance);
                setAgcBalance(formattedBalance);
            } catch (error) {
                console.error("Failed to refresh AGC balance:", error);
            }
        }
    }, [account]);

            useEffect(() => {
                if (account) {
                    refreshBalance();
                }
            }, [account, refreshBalance]);
    
            useEffect(() => {
                if (newTokenAddress) {
                    refreshBalance();
                }
            }, [newTokenAddress, refreshBalance]);
    


    const checkTokenBalance = async (tokenAddress, account) => {
        try {
            const ERC20_ABI = [
                "function balanceOf(address account) view returns (uint256)",
            ];

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
            
            const balance = await tokenContract.balanceOf(account);
            const formattedBalance = ethers.formatUnits(balance, 18); 
            console.log(`Token balance for account ${account}:`, formattedBalance);
            setUserTokenBalance(formattedBalance); 
        } catch (error) {
            console.error("Error fetching token balance:", error);
        }
    };

    const checkContractBalance = async () => {
    try {
        const contractAddress = '0x5CE6E2C5BCfF321Da9A7d11D7884153b1dDA9a92'; 
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        const balance = await provider.getBalance(contractAddress);
        const formattedBalance = ethers.formatUnits(balance, 18); 
        
        console.log(`Contract balance: ${formattedBalance} AGC`);
        
        
        setContractBalance(formattedBalance);

    } catch (error) {
        console.error("Error checking contract balance:", error);
        setError("Error checking contract balance: " + error.message);
    }
};






    const withdrawFees = async () => {
    try {
        const tokenFactoryAddress = '0x5CE6E2C5BCfF321Da9A7d11D7884153b1dDA9a92'; 
        const provider = new ethers.BrowserProvider(window.ethereum);

        const contractBalance = await provider.getBalance(tokenFactoryAddress);
        console.log(`Contract balance before withdrawal: ${ethers.formatUnits(contractBalance, 18)} AGC`);

        if (contractBalance > 0) {
            const tx = await contract.withdraw();  
            await tx.wait();
            console.log("Fees withdrawn successfully");
        } else {
            console.error("No AGC to withdraw");
            setError("No AGC available to withdraw.");
        }

    } catch (error) {
        console.error("Error withdrawing fees:", error);
        setError("Failed to withdraw fees: " + error.message);
    }
};



    const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const imageUrl = URL.createObjectURL(file);
        setUploadedImage(imageUrl); 
        setTokenImageUrl(imageUrl); 
    }
};


    const addTokenToMetaMask = async () => {
    if (!newTokenAddress || !tokenSymbol || !tokenName) {
        console.error("Token details not available yet.");
        setError("Token details not available yet.");
        return;
    }

    try {
        const wasAdded = await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: newTokenAddress, 
                    symbol: tokenSymbol,      
                    decimals: 18,             
                    image: '',                
                },
            },
        });

        if (wasAdded) {
            console.log("Token added to MetaMask");
        } else {
            console.error("Token not added to MetaMask");
        }
    } catch (error) {
        console.error("Error adding token to MetaMask:", error);
        setError("Error adding token to MetaMask: " + error.message);
    }
};





return (
    <div className="container">
        {/* Live Token Price Tracker at the top center of the container */}
        <div className="price-section top-center">
            <TokenPriceTracker />
        </div>

        <h1>Argochain Token Launcher</h1>
        <p className="small-text">Made by PrestigeNode</p>
        <button 
            className={`connect-wallet ${account ? 'connected' : ''}`} 
            onClick={connectWallet}
        >
            {account ? "Connected" : "Connect Wallet"}
        </button>
        
        {account && (
            <p className="account-info">
                Connected as: <span className="account-address">{account}</span>
            </p>
        )}
        
        {agcBalance && <p className="account-info">Your Balance: {agcBalance} AGC</p>}

        {!newTokenAddress ? (
            <div className="token-form">
                {/* Header Section */}
                <div className="form-header-container">
                    <h2 className="form-header">Create a New Token</h2>
                    <span className="fee-text">(Fee: 10 AGC)</span>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Token Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Argocoin"
                            value={tokenName}
                            onChange={(e) => setTokenName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Token Symbol</label>
                        <input
                            type="text"
                            placeholder="e.g. AGC"
                            value={tokenSymbol}
                            onChange={(e) => setTokenSymbol(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Token Supply</label>
                        <input
                            type="text"
                            placeholder="e.g. 1000000000"
                            value={initialSupply}
                            onChange={(e) => {
                                const value = e.target.value;
                                const validInteger = /^[0-9]*$/;
                                const MAX_SUPPLY = 1e12; // 1 trillion

                                if (value === '' || validInteger.test(value)) {
                                    if (Number(value) > MAX_SUPPLY) {
                                        setError(`Token supply cannot exceed ${MAX_SUPPLY.toLocaleString()}`);
                                    } else {
                                        setError(''); 
                                    }
                                    setInitialSupply(value);
                                }
                            }}
                        />
                        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Logo URL</label>
                        <input
                            type="text"
                            placeholder="e.g. https://example.com/logo.png"
                            value={tokenImageUrl}
                            onChange={(e) => setTokenImageUrl(e.target.value)}
                        />
                        <div className="upload-section">
                            <label htmlFor="file-upload" className="upload-link">Upload Image</label>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group" style={{ width: '100%' }}>
                    <label className="form-label">Description</label>
                    <textarea
                        placeholder="Project Description (optional)"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows="4"
                    />
                </div>

                <button onClick={createToken}>Create Token</button>

                {/* Preview Section */}
                {(tokenName || tokenSymbol || initialSupply || projectDescription) && (
                    <div className="token-preview">
                        <h3>Token Preview</h3>
                        <div className="preview-logo">
                            {uploadedImage ? (
                                <img src={uploadedImage} alt="Token Logo Preview" className="circle-logo" />
                            ) : (
                                <span className="placeholder-logo">No Logo</span>
                            )}
                        </div>
                        {tokenName && <p><strong className="token-attribute">Name:</strong> <span className="attribute-text">{tokenName}</span></p>}
                        {tokenSymbol && <p><strong className="token-attribute">Symbol:</strong> <span className="attribute-text">{tokenSymbol}</span></p>}
                        {initialSupply && (
                            <p>
                                <strong className="token-attribute">Supply:</strong> 
                                <span className="attribute-text">{Number(initialSupply).toLocaleString()}</span>
                            </p>
                        )}
                        {projectDescription && (
                            <p className="preview-description"><strong className="token-attribute">Description:</strong> <span className="attribute-text">{projectDescription}</span></p>
                        )}
                    </div>
                )}
            </div>
        ) : (
            <div id="token-details" className="token-created">
                <h3>New Token Created Successfully!</h3>
                
                {/* Display Token Logo */}
                <div className="preview-logo">
                    {uploadedImage ? (
                        <img src={uploadedImage} alt="Token Logo" className="circle-logo" />
                    ) : (
                        <span className="placeholder-logo">No Logo</span>
                    )}
                </div>

                {/* New Token Details */}
                <div className="attribute-wrapper">
                    <span className="token-attribute">Token Name:</span>
                    <span className="attribute-text"> {tokenName}</span>
                </div>

                <div className="attribute-wrapper">
                    <span className="token-attribute">Token Symbol:</span>
                    <span className="attribute-text"> {tokenSymbol}</span>
                </div>

                <div className="attribute-wrapper">
                    <span className="token-attribute">Token Address:</span>
                    <span className="attribute-text"> {newTokenAddress}</span>
                </div>

                <div className="attribute-wrapper">
                    <span className="token-attribute">Token Supply: </span>
                    <span className="attribute-text"> 
                        {Number(userTokenBalance) % 1 === 0 ? Number(userTokenBalance) : Number(userTokenBalance).toFixed(2).replace(/\.0+$/, '')}
                    </span>
                </div>

                {projectDescription && (
                    <div className="attribute-wrapper">
                        <span className="token-attribute">Description:</span>
                        <span className="attribute-text"> {projectDescription}</span>
                    </div>
                )}
                
                <div className="button-wrapper">
                    <button onClick={addTokenToMetaMask} className="add-to-metamask-btn">Add Token to MetaMask</button>
                </div>
            </div>
        )}

        {isLoading && (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Deploying your token... Please wait.</p>
            </div>
        )}

        {account && contract && account.toLowerCase() === owner.toLowerCase() && (
            <div className="owner-actions">
                <h2>Owner Actions</h2>
                <button onClick={withdrawFees}>Withdraw Fees</button>
                <h3>Contract Balance: {contractBalance} AGC</h3>
                <button onClick={checkContractBalance}>Check Contract Balance</button>
            </div>
        )}
    </div>
)};

export default TokenFactory;
