import React, { useState, useLayoutEffect, useRef } from 'react';
import { WorldIDWidget } from '@worldcoin/id'
import { useUserContext } from "../context/UserContext.tsx";

import { ethers } from 'ethers';
const Web3 = require("web3");
const qs = require('qs');
const BigNumber = require('bignumber.js');
// const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
// const web3 = createAlchemyWeb3("https://eth-mainnet.g.alchemy.com/v2/0XiCjY60o9aK3ngjMoJFaOuWl_97JRzL");
const infuraProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d")
const web3 = new Web3(
    new Web3.providers.HttpProvider(
        `https://mainnet.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d`
    )
);
const ERC20_ABI = [
    "function name() public view returns(string)",
    "function symbol() public view returns(string)",
    "function decimals() public view returns(uint8)",
    "function totalSupply() public view returns(uint256)",
    "function balanceOf(address _owner) public view returns(uint256 balance)",
    "function transfer(address _to, uint256 _value) public returns(bool success)",
    "function transferFrom(address _from, address _to, uint256 _value) public returns(bool success)",
    "function approve(address _spender, uint256 _value) public returns(bool success)",
    "function allowance(address _owner, address _spender) public view returns(uint256 remaining)"
]

const CONTRACT_ADDRESS = "0x6FF8Ad006DF88f8fDA884699D9365eC712690f94"

export default function ProjectList() {
    const { user, provider } = useUserContext();
    const [userVerified, setUserVerified] = useState(true)
    const firstUpdate = useRef(true);

    async function backendRequest(url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'same-origin', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        if (response.status === 200) {
            return response.json(); // parses JSON response into native JavaScript objects
        } else {
            return  // return null for failed requests
        }
    }

    async function authedBackendRequest(url = '', data = {}) {
        data['user_uuid'] = user.user_uuid
        data['auth_token'] = user.auth_token
        return backendRequest(url, data)
    }

    async function listProjects(url = '', data = {}) {
        const projects = await backendRequest("/api/list_projects", {
            "user_uuid": user.user_uuid,
            "auth_token": user.auth_token
        })
        return projects
    }

    async function checkIfUserVerified() {
        authedBackendRequest('api/check_user_unique_human', {}).then(res => setUserVerified(res.verified))
    }

    async function verifyWorldcoinProof(worldcoinProof) {
        authedBackendRequest('api/verify_worldcoin', {
            "proof": worldcoinProof.proof,
            "nullifier_hash": worldcoinProof.nullifier_hash,
            "merkle_root": worldcoinProof.merkle_root,
        }).then(response => {
            if (response.success) {
                setUserVerified(true)
            }
        })
    }

    async function investInProject(project_id, amount, token_address) {
        // swap token to USDC
        // https://docs.0x.org/0x-api-swap/guides/swap-tokens-with-0x-api#sell-100-dai-for-eth
        const ZERO_EX_ADDRESS = '0xdef1c0ded9bec7f1a1670819833240f027b25eff';
        const DAI_ADDRESS = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
        const USDC_ADDRESS = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';

        // Selling 100 DAI for ETH.
        const params = {
            sellToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            buyToken: 'DAI',
            // Note that the DAI token uses 18 decimal places, so `sellAmount` is `100 * 10^18`.    
            sellAmount: "10000",
            takerAddress: user.wallet_address,
        }

        // Set up a DAI allowance on the 0x contract if needed.
        // const dai = new web3.eth.Contract(ERC20_ABI, USDC_ADDRESS);
        const dai = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, infuraProvider);
        await dai.connect(provider.getSigner()).approve(ZERO_EX_ADDRESS, params.sellAmount)

        // Fetch the swap quote.
        const response = await fetch(
            `https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`
        );

        console.log(response.json());

        // Perform the swap.

        // await web3.eth.sendTransaction(await response.json());

        // Grant our contract USDC allowance for the converted amount

        // Call our contract to invest

        // On success popup share window
    }

    useLayoutEffect(() => {
        if (firstUpdate.current && user) {
            checkIfUserVerified()
            firstUpdate.current = false;
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    return (
        <div>
            <h1>Project List</h1>
            <button onClick={() => investInProject('something', 10000, '')}>swap</button>
            {!userVerified &&
                <WorldIDWidget
                    actionId="wid_staging_438cadb410ecfe8e7851b4ad4e58b6d9" // obtain this from developer.worldcoin.org
                    signal={user.wallet_address}
                    enableTelemetry
                    onSuccess={(verificationResponse) => verifyWorldcoinProof(verificationResponse)} // pass the proof to the API or your smart contract
                    onError={(error) => console.error(error)}
                    debug={true} // to aid with debugging, remove in production
                />
            }
        </div>
    )
}