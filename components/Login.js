import React, { useState } from "react";
import { useMoralis } from "react-moralis";

function Login({ setLoggedIn, loggedIn }) {
  const { Moralis } = useMoralis();

  async function connectWallet() {
    let user = Moralis.User.current();
    if (!user) {
      try {
        Moralis.authenticate({ type: "sol" }).then(function (user) {
          setLoggedIn(true);
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function disconnectWallet() {
    await Moralis.User.logOut();
    setLoggedIn(false);
  }

  return (
    <div className="loginContainer">
      {!loggedIn ? (
        <button
          type="button"
          onClick={connectWallet}
          className="btn btn-secondary"
        >
          Connect Wallet
        </button>
      ) : (
        <button
          type="button"
          onClick={disconnectWallet}
          className="btn btn-secondary"
        >
          Disconnect Wallet
        </button>
      )}
    </div>
  );
}

export default Login;
