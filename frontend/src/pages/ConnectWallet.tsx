// @ts-ignore: It's wrong
import React, { useState, useEffect, useRef } from 'react';
import Web3Modal from "web3modal";
import { ethers } from 'ethers';
import { useCookies } from "react-cookie";
// @ts-ignore
import { useUserContext } from '../context/UserContext.tsx';
// @ts-ignore
import { WalletSummary } from './WalletSummary.tsx';
import { Button } from '@mui/material';

const css = `
.wallet-address {
    color: #959393;
    line-height: 24px;
    align-self: center;
    margin-right: 60px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .navbar-right-image {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }
  
  .connect-wallet { h xzzqxs    zs   ;-[[p
    ]uh .[ nbv oo]
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    padding-left: 10px;
  }
  
  .log-out-tab {
    background-color: white;
    font-family: 'Montserrat', sans-serif;
    position: absolute;
    right: 70px;
    top: 60px;
    background-color: white;
    width: 120px;
    height: 48px;
    line-height: 24px;
    align-self: center;
    display: flex;
    flex-direction: row;
    align-items: right;
  }
  
  .log-out-image {
    width: 20px;
    height: 20px;
    /* float: right; */
    align-self: center;
    margin-left: 10px;
  }
  
  .log-out-button {
    border: none;
    color: #959393;
    width: 140px;
    height: 48px;
    float: right;
    align-self: center;
    text-align: right;
    padding-right: 10px;
  }
  `

// const infuraId = "80a1f23598974e86b9a2292d7fe3ba56"
const providerOptions = {
    binancechainwallet: {
        package: true
    },
    // walletconnect: {
    //   package: WalletConnect,
    //   options: {
    //     infuraId
    //   }
    // },
    // coinbasewallet: {
    //   package: CoinbaseWalletSDK, // Required
    //   options: {
    //     appName: "Jomo", // Required
    //     infuraId: infuraId, // Required
    //     rpc: "", // Optional if `infuraId` is provided; otherwise it's required
    //     chainId: 1, // Optional. It defaults to 1 if not provided
    //     darkMode: false // Optional. Use dark theme, defaults to false
    //   }
    // }
}

const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions
})

function ConnectWallet() {
    const wallet_address = useRef("")
    const user_uuid = useRef<string | null>(null)
    const auth_token = useRef("")
    const provider = useRef<ethers.providers.Web3Provider | null>(null)
    const pending_signin = useRef(false)
    const [mouseOverWallet, setMouseOverWallet] = useState(false)
    const { user, setUser, signer, setSigner } = useUserContext()
    const [cookies, setCookie, removeCookie] = useCookies(['wallet_address', 'user_uuid', 'auth_token']);
    const address_to_ens = useRef<Map<string, string>>(new Map())
    const [formatted_addresses, setFormattedAddresses] = useState<Map<string, string>>(new Map())
    const infuraProvider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d')
    const [openSummary, setOpenSummary] = useState(false);

    const handleCloseSummary = () => {
        setOpenSummary(false);
    };

    async function backendRequest(url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'same-origin', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        if (response.status === 200) {
            return response.json(); // parses JSON response into native JavaScript objects
        } else if (response.status === 403) {
            reSignIn()
            return
        } else {
            return  // return null for failed requests
        }
    }

    async function authedBackendRequest(url = '', data = {}) {
        data['user_uuid'] = user_uuid.current
        data['auth_token'] = auth_token.current
        return backendRequest(url, data)
    }

    const obfuscateAddress = (address) => {
        return address.substring(0, 6) + "......" + address.substring(38)
    }

    const lookupEns = (address: string) => {
        if (address_to_ens.current.has(address)) {
            return
        }
        address_to_ens.current.set(address, obfuscateAddress(address))
        setFormattedAddresses(new Map(address_to_ens.current))

        infuraProvider.lookupAddress(address).then((ens_name) => {
            if (ens_name) {
                address_to_ens.current.set(address, ens_name)
                setFormattedAddresses(new Map(address_to_ens.current))
            }
        })
    }

    const connectWeb3Modal = async () => {
        if (web3Modal.cachedProvider) {
            web3Modal.clearCachedProvider()
        }
        signIn()
    }

    const connectWallet = async () => {
        const wallet = await web3Modal.connect()
        provider.current = new ethers.providers.Web3Provider(wallet)
        setSigner(provider.current.getSigner())

        const signer = provider.current!.getSigner()
        wallet_address.current = await signer.getAddress()
        setCookie('wallet_address', wallet_address.current, { path: '/' })

        lookupEns(wallet_address.current)
    }

    const getNonce = async (nonce_context) => {
        return backendRequest("/api/get_signature_nonce", {
            "wallet_address": wallet_address.current,
            "nonce_context": nonce_context
        })
    }

    const getSignature = async (message) => {
        const signer = provider.current!.getSigner()
        return signer.signMessage(message)
    }

    const getUser = async (signature) => {
        backendRequest("/api/sign_in", {
            "wallet_address": wallet_address.current,
            "signature": signature
        }).then((data) => {
            user_uuid.current = data.user_uuid
            auth_token.current = data.auth_token
            setCookie('user_uuid', user_uuid.current, { path: '/' })
            setCookie('auth_token', auth_token.current, { path: '/' })
            setUser(data)
        })
    }

    const reSignIn = async () => {
        const user_data: any = {
            "wallet_address": wallet_address.current,
        }
        setUser(user_data)
        user_uuid.current = ""
        auth_token.current = ""
        removeCookie('user_uuid', { path: '/' })
        removeCookie('auth_token', { path: '/' })

        signInInternal()
    }

    const signIn = async () => {
        await connectWallet()

        // Grab the token cached in cookies
        if (cookies.wallet_address && cookies.user_uuid && cookies.auth_token) {
            user_uuid.current = cookies.user_uuid
            auth_token.current = cookies.auth_token
            wallet_address.current = cookies.wallet_address

            const user_data: any = {
                "user_uuid": user_uuid.current,
                "wallet_address": wallet_address.current,
                "auth_token": auth_token.current
            }
            setUser(user_data)
        }

        signInInternal()
    }

    const signInInternal = async () => {
        // If not that both user_uuid and auth_token are present, we need to sign in again
        if (!(user_uuid.current && auth_token.current) && !pending_signin.current) {
            pending_signin.current = true
            var signin_nonce = await getNonce("sign_in")
            var message = "Sign in XXX with wallet: " + wallet_address.current + ".\r\n\r\n(--Ignore Info Below--)\r\nNonce: " + signin_nonce.nonce
            var signature = await getSignature(message)
            getUser(signature)
            pending_signin.current = false
        }
    }

    const disconnectWeb3Modal = async () => {
        web3Modal.clearCachedProvider()

        provider.current = null
        setSigner(null)
        wallet_address.current = ""
        user_uuid.current = ""
        auth_token.current = ""
        removeCookie('wallet_address', { path: '/' })
        removeCookie('user_uuid', { path: '/' })
        removeCookie('auth_token', { path: '/' })

        window.location.reload()
    }

    useEffect(() => {
        if (web3Modal.cachedProvider) {
            signIn()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleMouseOverWallet = () => {
        setMouseOverWallet(true);
        setOpenSummary(true);
    };

    const handleMouseOutWallet = () => {
        setMouseOverWallet(false);
        setOpenSummary(false);

    };

    return (
        <>
            <style>
                {css}
            </style>
            <div className='wallet-address' onMouseOver={handleMouseOverWallet}>
                <img
                    className='navbar-right-image'
                    alt={"Wallet"}
                    src={require("../images/wallet.png")}
                />
                {user && user.wallet_address ?
                    formatted_addresses.get(user.wallet_address) :
                    <p onClick={() => connectWeb3Modal()} className='connect-wallet'>Connect Wallet</p>
                }
            </div>

            {user && user.wallet_address &&
                <div onMouseOver={handleMouseOverWallet} onMouseOut={handleMouseOutWallet}>
                    <Button onClick={() => disconnectWeb3Modal()}>Log out</Button>
                </div>
            }

            {user && user.wallet_address && mouseOverWallet &&
                <WalletSummary open={openSummary} onClose={handleCloseSummary}
                />
            }
        </>
    )
}

export default ConnectWallet