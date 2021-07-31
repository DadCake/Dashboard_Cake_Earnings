"use strict";

// Unpkg imports
let Web3Modal = window.Web3Modal.default;
let WalletConnectProvider = window.WalletConnectProvider.default;
let Fortmatic = window.Fortmatic;
let evmChains = window.evmChains;

let web3;
let web3Modal;
let provider;
let selectedAccount;
let accounts;
let contract;

async function init() {
    // Check that the web page is run in a secure context,
    // as otherwise MetaMask won't be available
    if (location.protocol !== 'https:') {
        const alert = document.querySelector("#alert-error-https");
        alert.style.display = "block";
        return;
    }
    document.querySelector("#btn-connectWallet2").textContent = 'Connect Wallet';
}

async function fetchAccountData() {

    if (window.ethereum) {
        await window.ethereum.enable();
        provider = window.ethereum;
        selectedAccount = window.ethereum.selectedAddress;
        web3 = new window.ethers.providers.Web3Provider(provider);
    } else {
        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider,
                display: { name: 'Trust Wallet/MetaMask/Mobile' },
                options: {
                    rpc: { 56: 'https://bsc-dataseed1.ninicoin.io' },
                    network: 'binance',
                    infuraId: "a6ca7a0157184aedbafef89ee4794dc2",
                }
            },
            fortmatic: {
                package: Fortmatic,
                options: {
                    key: "pk_live_D8B839D52A5C60B9"
                }
            }
        }

        web3Modal = new Web3Modal({
            cacheProvider: false, // optional
            providerOptions, // required
            disableInjectedProvider: false, //optional. For MetaMask/Brave/Opera.
        });

        provider = await web3Modal.connect();
        selectedAccount = provider.accounts[0];
        web3 = new window.ethers.providers.Web3Provider(provider);

        console.log("Web3Modal instance is", web3Modal);
        console.log("WalletConnectProvider is", WalletConnectProvider);
        console.log("Fortmatic is", Fortmatic);
    }

    console.log("Web3 instance is", web3);
    console.log("Selected Account", selectedAccount);

}

async function claimCAKEReward() {
    try {
        try {
            await fetchAccountData();
            console.log('Wallet Connected: '+ selectedAccount);
        } catch (e) {
            console.log("Could not get a wallet connection");
            alert('Error, Could not get a wallet connection: ' + e);
            return;
        }

        //Sub to change events
        provider.on("accountsChanged", (accounts) => {
            fetchAccountData();
        });
        provider.on("chainChanged", (chainId) => {
            fetchAccountData();
        });
        provider.on("networkChanged", (networkId) => {
            fetchAccountData();
        });
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', function() {
                fetchAccountData();
            });
        }
        

        const abi = [
            { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isExcluded", "type": "bool" }], "name": "ExcludeFromFees", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "accounts", "type": "address[]" }, { "indexed": false, "internalType": "bool", "name": "isExcluded", "type": "bool" }], "name": "ExcludeMultipleAccountsFromFees", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": true, "internalType": "bool", "name": "earlyParticipant", "type": "bool" }, { "indexed": false, "internalType": "uint256", "name": "numberOfBuyers", "type": "uint256" }], "name": "FixedSaleBuy", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "participants", "type": "address[]" }], "name": "FixedSaleEarlyParticipantsAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "newValue", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "oldValue", "type": "uint256" }], "name": "GasForProcessingUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "newLiquidityWallet", "type": "address" }, { "indexed": true, "internalType": "address", "name": "oldLiquidityWallet", "type": "address" }], "name": "LiquidityWalletUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "iterations", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "claims", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "lastProcessedIndex", "type": "uint256" }, { "indexed": true, "internalType": "bool", "name": "automatic", "type": "bool" }, { "indexed": false, "internalType": "uint256", "name": "gas", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "processor", "type": "address" }], "name": "ProcessedDividendTracker", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "tokensSwapped", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "SendDividends", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "pair", "type": "address" }, { "indexed": true, "internalType": "bool", "name": "value", "type": "bool" }], "name": "SetAutomatedMarketMakerPair", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "tokensSwapped", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "ethReceived", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokensIntoLiqudity", "type": "uint256" }], "name": "SwapAndLiquify", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "newAddress", "type": "address" }, { "indexed": true, "internalType": "address", "name": "oldAddress", "type": "address" }], "name": "UpdateDividendTracker", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "newAddress", "type": "address" }, { "indexed": true, "internalType": "address", "name": "oldAddress", "type": "address" }], "name": "UpdateUniswapV2Router", "type": "event" }, { "inputs": [], "name": "CAKERewardsFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "accounts", "type": "address[]" }], "name": "addFixedSaleEarlyParticipants", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "automatedMarketMakerPairs", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "bounceFixedSaleWallet", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "dividendTokenBalanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "dividendTracker", "outputs": [{ "internalType": "contract DADCAKE_Dividend_Tracker", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "bool", "name": "excluded", "type": "bool" }], "name": "excludeFromFees", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "accounts", "type": "address[]" }, { "internalType": "bool", "name": "excluded", "type": "bool" }], "name": "excludeMultipleAccountsFromFees", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "fixedSaleBuyers", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "fixedSaleEarlyParticipantBuysThreshold", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "fixedSaleEarlyParticipantDuration", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "fixedSaleEarlyParticipants", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "fixedSaleStartTimestamp", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "gasForProcessing", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "getAccountDividendsInfo", "outputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "int256", "name": "", "type": "int256" }, { "internalType": "int256", "name": "", "type": "int256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "getAccountDividendsInfoAtIndex", "outputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "int256", "name": "", "type": "int256" }, { "internalType": "int256", "name": "", "type": "int256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getClaimWait", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getLastProcessedIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getNumberOfDividendTokenHolders", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTotalDividendsDistributed", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTradingIsEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "isExcludedFromFees", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "liquidityFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "liquidityWallet", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxSellTransactionAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "numberOfFixedSaleBuys", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "gas", "type": "uint256" }], "name": "processDividendTracker", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "sellFeeIncreaseFactor", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "pair", "type": "address" }, { "internalType": "bool", "name": "value", "type": "bool" }], "name": "setAutomatedMarketMakerPair", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "swapTokensAtAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalFees", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "tradingEnabledTimestamp", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "uniswapV2Pair", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "uniswapV2Router", "outputs": [{ "internalType": "contract IUniswapV2Router02", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "claimWait", "type": "uint256" }], "name": "updateClaimWait", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newAddress", "type": "address" }], "name": "updateDividendTracker", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "newValue", "type": "uint256" }], "name": "updateGasForProcessing", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newLiquidityWallet", "type": "address" }], "name": "updateLiquidityWallet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newAddress", "type": "address" }], "name": "updateUniswapV2Router", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "withdrawableDividendOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "stateMutability": "payable", "type": "receive" }
        ];

        const signer = web3.getSigner();
        contract = new window.ethers.Contract('0x3c5aadd44012dac5e2dde89e79e39742554c5a89', abi, signer);

        //get wallet token balance
        var walletTokenBalance = await contract.balanceOf(selectedAccount) 
        walletTokenBalance = walletTokenBalance / (10 ** 18);
        
        console.log('Wallet Balance', walletTokenBalance.toString());
        document.querySelector("#DADCAKEBalance").textContent = walletTokenBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // Total Claimed by users
        var totalDivs = await contract.getTotalDividendsDistributed();
        console.log('Total Dividends Distributed', totalDivs.toString());
        document.querySelector("#totalCAKEClaimedByAllHolders").textContent = (totalDivs.toString() / (10 ** 18)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' $CAKE';
        fetch('https://api.binance.com/api/v3/avgPrice?symbol=CAKEUSDT')
            .then(r => r.json()
                .then(function(j) {
                    console.log('Total Dividends USD console', totalDivs * parseFloat(j.price));
                    document.querySelector("#usdTotalCAKEClaimedByAllHolders").textContent = '$' + (totalDivs.toString() * parseFloat(j.price) / (10 ** 18)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' USD';
                })
            );

        var dividendInfo = await contract.getAccountDividendsInfo(selectedAccount);
        
        //Wallet claimed to USD
        var totalD = (parseInt(dividendInfo[4]) / (10 ** 18)).toPrecision(4).toString();
        console.log('Total Dividends Claimed to This Wallet', totalD); 

        fetch('https://api.binance.com/api/v3/avgPrice?symbol=CAKEUSDT')
            .then(rh => rh.json()
                .then(function(toUSD) {
                    console.log('Total Dividends Claimed in USD Wallet', totalD * parseFloat(toUSD.price));
                    document.querySelector("#toUSD").textContent = '$' + (totalD.toString() * parseFloat(toUSD.price)).toFixed(5) + ' USD';
                })
            );


        //Current Balance to USD
        var CurrentBalance = (parseInt(dividendInfo[3]) / (10 ** 18)).toPrecision(4).toString();

        fetch('https://api.binance.com/api/v3/avgPrice?symbol=CAKEUSDT')
            .then(rb => rb.json()
                .then(function(CBtoUSD) {
                    console.log('Current Balance to Claim in USD', CurrentBalance * parseFloat(CBtoUSD.price));
                    document.querySelector("#CBtoUSD").textContent = '$' + (CurrentBalance.toString() * parseFloat(CBtoUSD.price)).toFixed(5) + ' USD';
                })
            );

        
        document.querySelector("#totalClaimedCAKE").textContent = totalD + ' $CAKE';
        document.querySelector("#CurrentBalance").textContent = (parseInt(dividendInfo[3]) / (10 ** 18)).toPrecision(4).toString() + ' $CAKE';
        document.querySelector("#lastPayoutDateTime").textContent = dividendInfo[5] > 0 ? new Date(dividendInfo[5] * 1000).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ") : 'Never';
        document.querySelector("#nextPayoutAmountandTime").textContent = dividendInfo[6] > 0 ? new Date(dividendInfo[6] * 1000).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ") : 'Never';
    
        document.querySelector("#btn-connectWallet2").textContent = smartTrim(selectedAccount, 10);
        document.querySelector("#btn-connectWallet2").className = 'connected';
        document.querySelector("#btn-logout").textContent = 'Logout';
        document.querySelector("#btn-logout").className = 'logout mx-2';
        
    } catch (e) {
        alert('' + e);
    }
}

window.addEventListener('load', async() => {
    await init();
    document.querySelector("#btn-connectWallet2").addEventListener("click", claimCAKEReward);    
});

function smartTrim(string, maxLength) {
    if (!string) return string;
    if (maxLength < 1) return string;
    if (string.length <= maxLength) return string;
    if (maxLength == 1) return string.substring(0,1) + '...';

    var midpoint = Math.ceil(string.length / 2);
    var toremove = string.length - maxLength;
    var lstrip = Math.ceil(toremove/2);
    var rstrip = toremove - lstrip;
    return string.substring(0, midpoint-lstrip) + '...' 
    + string.substring(midpoint+rstrip);
}  
