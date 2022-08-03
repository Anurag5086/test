import React, { useState } from "react";
import { actions, NodeWallet } from "@metaplex/js";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { useMoralis } from "react-moralis";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import Image from "next/image";

function NftForm({ loggedIn }) {
  const { Moralis } = useMoralis();
  const [nftName, setNFTName] = useState();
  const [nftDesccriptiom, setNFTDescription] = useState();
  const [succesModal, setSuccessModal] = useState(false);

  const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  );

  let associatedAddress = "";

  async function findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
    const array = await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );
    associatedAddress = array[0];
  }

  async function uploadAndMintNFT() {
    // Storing the file
    console.log("Btn clciked");
    const keypair = Keypair.generate();
    const wallet = new NodeWallet(keypair);
    let user = Moralis.User.current();
    const userWallet = new PublicKey(user.get("solAddress"));

    const fileInput = document.getElementById("file");
    const data = fileInput.files[0];

    const imageFile = new Moralis.File(data.name, data);
    await imageFile.saveIPFS().then();

    // Storing the metadata

    const imageURI = imageFile.ipfs();
    const metadata = {
      name: nftName,
      symbol: "MLH",
      description: nftDesccriptiom,
      image: imageURI,
      seller_fee_basis_points: 0,
      properties: {
        files: [
          {
            uri: imageURI,
            type: "image/jpeg",
          },
        ],
        category: "image",
        creators: [
          {
            address: keypair.publicKey,
            verified: true,
            share: 100,
          },
        ],
      },
    };
    const metadataFile = new Moralis.File("metadata.json", {
      base64: btoa(JSON.stringify(metadata)),
    });

    await metadataFile.saveIPFS();
    const metadataURI = metadataFile.ipfs();
    console.log(metadataURI);

    // minting
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const feePayerAirdropSignature = await connection.requestAirdrop(
      keypair.publicKey,
      10000000
    );
    await connection.confirmTransaction(feePayerAirdropSignature);
    let mintaddress = "";
    const mintNFTResponse = await actions
      .mintNFT({
        connection,
        wallet: wallet,
        uri: metadataURI,
        maxSupply: 1,
      })
      .then((mintNFTResponse) => {
        mintaddress = mintNFTResponse.mint;
        console.log("nft minted");
      });

    await findAssociatedTokenAddress(keypair.publicKey, mintaddress);

    const sendingToken = await actions
      .sendToken({
        connection,
        amount: 1,
        destination: userWallet,
        source: associatedAddress,
        wallet: wallet,
        mint: mintaddress,
      })
      .then((res) => {
        setSuccessModal(true);
        console.log("nft sent");
      });
  }
  return (
    <div className="mainContainer">
      <div className="innerContainer">
        <h1 className="heading">Lightning NFT Minter</h1>
        <div className="mb-3 mt-4">
          <label className="form-label">NFT Name</label>
          <input
            type="text"
            className="form-control"
            id="nftname"
            placeholder="Cool NFT..."
            onChange={(e) => setNFTName(e.target.value)}
          />
        </div>
        <div className="mb-3 mt-3">
          <label className="form-label">NFT Description</label>
          <textarea
            className="form-control"
            id="nftdescription"
            placeholder="Description..."
            onChange={(e) => setNFTDescription(e.target.value)}
            rows="3"
          ></textarea>
        </div>

        <input type="file" id="file" className="inputFile" />
        {loggedIn ? (
          <button
            className="btnMargin btn btn-secondary"
            onClick={uploadAndMintNFT}
          >
            Mint NFT
          </button>
        ) : (
          <button className="btnMargin btn btn-secondary disabled">
            Connect Wallet to Mint NFT
          </button>
        )}
      </div>

      {!succesModal ? (
        <></>
      ) : (
        <>
          <div className="modal">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Modal title</h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <Image
                    src="/yayy-happy.gif"
                    alt="yayy"
                    height={200}
                    width={300}
                  />
                  <p>
                    Yayyy!!🎊 You have minted your cool NFT. Checkout out your
                    phantom wallet for surprise.🎊🎊
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button type="button" className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NftForm;
