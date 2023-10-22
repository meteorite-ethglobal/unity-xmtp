// load network.js to get network/chain id
document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./network.js" }));
// load web3modal to connect to wallet
document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./web3/lib/web3modal.js" }));

//document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://unpkg.com/@web3modal/ethereum@2.7.1/dist/cdn/bundle-b2289479.js" }));

// load web3js to create transactions
//document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "./web3/lib/web3.min.js" }));
// uncomment to enable torus wallet
//document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://cdn.jsdelivr.net/npm/@toruslabs/torus-embed" }));
// uncomment to enable walletconnect with metamask
//document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://unpkg.com/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js" }));

//WalletConnect alone
document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://unpkg.com/@walletconnect/ethereum-provider@latest/dist/index.umd.js" }));


document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://cdn.ethers.io/lib/ethers-5.4.umd.min.js" }));
// Load defi connect
//document.body.appendChild(Object.assign(document.createElement("script"), { type: "text/javascript", src: "https://unpkg.com/deficonnect@1.1.13/dist/index.umd.js" }));



// load web3gl to connect to unity
window.web3gl = {
    networkId: 0,
    connect,
    interactWithContract,
    connectAccount: "",
    signer:"",
    signMessage,
    signMessageResponse: "",
    callContract,
    callContractResponse:"",
    callContractError:"",
    sendTransaction,
    sendTransactionResponse: "",
    sha3Message,
    hashMessageResponse: "",
    sendTransactionResponse: "",
    sendTransactionData,
    sendTransactionResponseData:"",
    sendContract,
    sendContractResponse: "",
};

// will be defined after connect()
let web3Provider;
let wallet;
let web3;


//HERE TORUS WITH ETHERS -----------------------------------------

async function connect(key, rpc) {

  const provider = new ethers.providers.JsonRpcProvider(rpc); 
  wallet = new ethers.Wallet(key, provider);
  const signer = wallet.Signer;
  const account = wallet.address;
  web3gl.connectAccount = account;
  web3gl.signer = wallet;

}

async function interactWithContract(rpc, contractAddress, contractABI, methodName, args) {
  // Ensure a wallet has been initialized
  if (!wallet) {
      console.error('Wallet not initialized. Call connect() first.');
      return;
  }

  // Connect to the specified RPC
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  // Prepare the transaction object
  const tx = {
      // Define an example gas limit and gas price. Adjust these values as needed.
      gasLimit: ethers.utils.hexlify(100000),  // Example value, adjust based on your contract's needs
      gasPrice: ethers.utils.parseUnits('20', 'gwei') // Example value, adjust based on current network conditions
  };

  // Call the specified method on the contract
  try {
      const method = contract[methodName];
      if (!method) {
          console.error(`No such method: ${methodName}`);
          return;
      }

      const parsedArgs = JSON.parse(args);

      // Incorporate the transaction settings
      if (parsedArgs.length > 0 && typeof parsedArgs[parsedArgs.length - 1] === 'object') {
          // If the last argument is an object, assume it's the tx overrides
          Object.assign(parsedArgs[parsedArgs.length - 1], tx);
      } else {
          parsedArgs.push(tx);
      }

      const result = await method(...parsedArgs);
      // Use this pattern to provide the result (transactionHash) or error message
      if (result && result.hash) {  // If the result object has a transactionHash
          window.web3gl.sendContractResponse = result.hash;
      } else {
          throw new Error("Unexpected result format");
      }
  } catch (error) {
      console.error('Error interacting with contract:', error);
      window.web3gl.sendContractResponse = error.message;
  }
}



/*
Will calculate the sha3 of the input.
window.web3gl.sha3Message("hello")
*/
async function sha3Message(message) {
    try {
        const hashedMessage = await web3.utils.sha3(message);
        window.web3gl.hashMessageResponse = hashedMessage;
    } catch (error) {
        window.web3gl.hashMessageResponse = error.message;
    }
}

/*
paste this in inspector to connect to sign message:
window.web3gl.signMessage("hello")
*/
async function signMessage(message) {
  try {
    const from = (await web3.eth.getAccounts())[0];
    const signature = await web3.eth.personal.sign(message, from, "")
      window.web3gl.signMessageResponse = signature;
  } catch (error) {
    window.web3gl.signMessageResponse = error.message;
  }
}

/*
paste this in inspector to send eth:
const to = "0xdD4c825203f97984e7867F11eeCc813A036089D1"
const value = "12300000000000000"
const gasLimit = "21000" // gas limit
const gasPrice = "33333333333"
window.web3gl.sendTransaction(to, value, gasLimit, gasPrice);
*/
async function sendTransaction(to, value, gasLimit, gasPrice) {
  const from = (await web3.eth.getAccounts())[0];
  web3.eth
      .sendTransaction({
        from,
        to,
        value,
        gas: gasLimit ? gasLimit : undefined,
        gasPrice: gasPrice ? gasPrice : undefined,
      })
      .on("transactionHash", (transactionHash) => {
        window.web3gl.sendTransactionResponse = transactionHash;
      })
      .on("error", (error) => {
        window.web3gl.sendTransactionResponse = error.message;
      });
}

/*
paste this in inspector to send eth:
const to = "0x20E7D0C4182149ADBeFE446E82358A2b2D5244e9"
const value = "0"
const gasPrice = "1100000010"
const gasLimit = "228620" // gas limit
const data = "0xd0def521000000000000000000000000d25b827d92b0fd656a1c829933e9b0b836d5c3e20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002e516d586a576a6a4d55387233395543455a38343833614e6564774e5246524c767656396b7771314770436774686a000000000000000000000000000000000000"
window.web3gl.sendTransactionData(to, value, gasPrice, gasLimit, data);
*/
async function sendTransactionData(to, value, gasPrice, gasLimit, data) {
    const from = (await web3.eth.getAccounts())[0];
    web3.eth
        .sendTransaction({
            from,
            to,
            value,
            gasPrice: gasPrice ? gasPrice : undefined,
            gas: gasLimit ? gasLimit : undefined,
            data: data ? data : undefined,
        })
        .on("transactionHash", (transactionHash) => {
            window.web3gl.sendTransactionResponseData = transactionHash;
        })
        .on("error", (error) => {
            window.web3gl.sendTransactionResponseData = error.message;
        });
}

/*
calls a non-mutable contract method.
const method = "x"
const abi = `[ { "inputs": [], "name": "increment", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "x", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ]`;
const contract = "0xB6B8bB1e16A6F73f7078108538979336B9B7341C"
const args = "[]"
window.web3gl.callContract(method, abi, contract, args)
*/
async function callContract(method, abi, contract, args) {
    const from = (await web3.eth.getAccounts())[0];
    new web3.eth.Contract(JSON.parse(abi), contract).methods[method](
        ...JSON.parse(args)
    ).call()
        .then((result) => window.web3gl.callContractResponse = result)
        .catch((error) => window.web3gl.callContractError = error.message);
}

/*
paste this in inspector to connect to interact with contract:
const method = "increment"
const abi = `[ { "inputs": [], "name": "increment", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "x", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ]`;
const contract = "0xB6B8bB1e16A6F73f7078108538979336B9B7341C"
const args = "[]"
const value = "0"
const gasLimit = "222222" // gas limit
const gasPrice = "333333333333"
window.web3gl.sendContract(method, abi, contract, args, value, gasLimit, gasPrice)
*/
async function sendContract(method, abi, contract, args, value, gasLimit, gasPrice) {
  const from = (await web3.eth.getAccounts())[0];
  new web3.eth.Contract(JSON.parse(abi), contract).methods[method](...JSON.parse(args))
      .send({
        from,
        value,
        gas: gasLimit ? gasLimit : undefined,
        gasPrice: gasPrice ? gasPrice : undefined,
      })
      .on("transactionHash", (transactionHash) => {
        window.web3gl.sendContractResponse = transactionHash;
      })
      .on("error", (error) => {
        window.web3gl.sendContractResponse = error.message;
      });
}

// add new wallet to in metamask
async function addEthereumChain() {
  const account = (await web3.eth.getAccounts())[0];

  // fetch https://chainid.network/chains.json
  const response = await fetch("https://chainid.network/chains.json");
  const chains = await response.json();

  // find chain with network id
  const chain = chains.find((chain) => chain.chainId == window.web3ChainId);

  const params = {
    chainId: "0x" + chain.chainId.toString(16), // A 0x-prefixed hexadecimal string
    chainName: chain.name,
    nativeCurrency: {
      name: chain.nativeCurrency.name,
      symbol: chain.nativeCurrency.symbol, // 2-6 characters long
      decimals: chain.nativeCurrency.decimals,
    },
    rpcUrls: chain.rpc,
    blockExplorerUrls: [chain.explorers && chain.explorers.length > 0 && chain.explorers[0].url ? chain.explorers[0].url : chain.infoURL],
  };

  await window.ethereum
      .request({
        method: "wallet_addEthereumChain",
        params: [params, account],
      })
      .catch(() => {
        // I give up
        window.location.reload();
      });
}


/*async function sendXMTPMessage() {

  const ethProvider = new window.ethers.providers.Web3Provider(provider);

  const wallet = window.ethers.Wallet.createRandom();

  console.log(window.Client);

  const Xmtp =  await window.Client.create(wallet, { env: "dev" });

  const conversation = await Xmtp.conversations.newConversation(
    "0x937C0d4a6294cdfa575de17382c7076b579DC176",
  );

  const messages = await conversation.messages();

  await conversation.send("gm");
  // Listen for new messages in the conversation
  for await (const message of await conversation.streamMessages()) {
  console.log(`[${message.senderAddress}]: ${message.content}`);
  
  }

}*/
