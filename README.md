# Sol-minter 

A lightning-fast NFT minter on Solana. The UI is made simple so that the audience who is new to the Web3 world can also utilize it.
The function is to allow the user to upload any image that he/she likes and the dApp converts that into an NFT and delivers it to the user's wallet. 

## Workflow
- User logs in via Phantom Wallet 
- User fills in the details like the funky NFT Name and its awesome description and also uploads the image. 
- After hitting Submit, blockchain magic happens and within a few seconds, the image is now an NFT delivered to the User's wallet. 

## Functioning (Blockchain Magic)

- On the backend side of the website after collecting the data from the User, the image gets uploaded to Inter Planetary File System ( IPFS ) which is a decentralized platform to store files. 
- The rest details are added with the image URI in a JSON file that follows the JSON Schema required by the Solana Ecosystem to mint the NFT. 
- This JSON file is also uploaded on IPFS and is the URI is later forwarded to the Metaplex Functions. 
- Metaplex JS does the task of minting the NFT and sending it to the User, Metaplex is a toolset built upon Solana Program Library. 


## Goal

- Providing a simple fast NFT minter, something which acts as a bridge for all the Web2 people to get on board with the crypto roller coaster. 
 
