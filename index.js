import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMoralis } from "react-moralis";
import { actions, utils, programs, NodeWallet } from "@metaplex/js";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export default function Home() {
  const { Moralis } = useMoralis();
  async function login() {
    let user = Moralis.User.current();
    if (!user) {
      try {
        Moralis.authenticate({ type: "sol" }).then(function (user) {
          console.log(user.get("solAddress"));
          alert("Login successful");
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
    alert("Logout successful");
  }

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
    console.log(associatedAddress);
  }

  async function toTheMoon() {
    // Storing the file
    console.log("Uploading the image");

    const keypair = Keypair.generate();
    const wallet = new NodeWallet(keypair);
    let user = Moralis.User.current();
    const userWallet = new PublicKey(user.get("solAddress"));

    console.log(keypair.publicKey.toBase58());

    const fileInput = document.getElementById("file");
    const data = fileInput.files[0];
    const imageFile = new Moralis.File(data.name, data);
    await imageFile.saveIPFS();

    // Storing the metadata

    const imageURI = imageFile.ipfs();
    console.log("Image URI: ", imageURI);
    const metadata = {
      name: document.getElementById("metadataName").value,
      symbol: "MLH",
      description: document.getElementById("metadataDescription").value,
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
    console.log("Uploading Metadata");
    await metadataFile.saveIPFS();
    const metadataURI = metadataFile.ipfs();
    console.log(metadataURI);
    alert("Upload successful");

    // minting
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const feePayerAirdropSignature = await connection.requestAirdrop(
      keypair.publicKey,
      LAMPORTS_PER_SOL
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
        console.log(mintNFTResponse);
        mintaddress = mintNFTResponse.mint;
        alert("Mint successful");
        console.log("Mint address: ", mintaddress);
      });

    // sending the token to the user

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
      .then((sendTokenResponse) => {
        console.log(sendTokenResponse);
        alert("Send successful");
      });
  }
  return (
    <div className={styles.container}>
      Hello
      <form>
        <input
          type="text"
          name="metadataName"
          id="metadataName"
          placeholder="Metadata Name"
        />
        <br />
        <br />
        <input
          type="text"
          name="metadataDescription"
          id="metadataDescription"
          placeholder="Metadata Description"
        />
        <br />
        <br />
        <input type="file" name="fileInput" id="file" placeholder="File" />
      </form>
      <button onClick={login}>Login</button>
      <button onClick={logOut}>logout</button>
      <button onClick={toTheMoon}>Upload</button>
    </div>
  );
}
