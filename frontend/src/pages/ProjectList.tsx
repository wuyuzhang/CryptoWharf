import React, { useState, useLayoutEffect, useRef } from 'react';
import { WorldIDWidget } from '@worldcoin/id'
// @ts-ignore
import { useUserContext } from "../context/UserContext.tsx";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import { Typography, OutlinedInput, InputAdornment, Button, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ethers } from 'ethers';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const Web3 = require("web3");
const qs = require('qs');
const infuraProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d")
const web3 = new Web3(
    new Web3.providers.HttpProvider(
        `https://polygon-mumbai.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d`
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
    "function allowance(address _owner, address _spender) public view returns(uint256 remaining)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
]
const CONTRACT_ABI = [
    "function delegateInvestInPlan(address investor, uint256 amount, string plan_id)",
]

const CONTRACT_ADDRESS = "0x6FF8Ad006DF88f8fDA884699D9365eC712690f94"

export default function ProjectList() {
    const { user, signer } = useUserContext();
    const [userVerified, setUserVerified] = useState(true)
    const [projects, setProjects] = useState<any[]>([])
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

    async function listProjects() {
        authedBackendRequest('api/list_projects', {})
            .then(
                res => {
                    // console.log(res);
                    console.log(res.projectObjects);
                    setProjects(res.projectObjects);
                })
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
        // swap LINK to USDC
        const ZERO_EX_ADDRESS = '0xf471d32cb40837bf24529fcf17418fc1a4807626';
        const USDC_ADDRESS = '0xe097d6b3100777dc31b34dc2c58fb524c2e76921';
        const MATIC_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        const WETH_ADDRESS = '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa';

        // Selling USDC for LINK.
        const params = {
            sellToken: USDC_ADDRESS,
            buyToken: MATIC_ADDRESS,
            sellAmount: amount,
            takerAddress: user.wallet_address,
        }

        // Set up a LINK allowance on the 0x contract if needed.
        const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, infuraProvider);
        const tx = await usdc.connect(signer).approve(ZERO_EX_ADDRESS, params.sellAmount)
        await tx.wait()
        const quote_response = await fetch(
            `https://mumbai.api.0x.org/swap/v1/quote?${qs.stringify(params)}`
        )
        const res_json = await quote_response.json()
        const signedTx = await web3.eth.accounts.signTransaction(res_json, "7fc22f70a4ee05aa17a3a7db2da7e2a23fcaf0c0f7228e262f74d689da1d9d7a")

        // Sending the transaction to the network
        const swap_tx = await web3.eth
            .sendSignedTransaction(signedTx.rawTransaction)
            .once("transactionHash", (txhash) => {
                console.log(`Mining transaction ...`);
                console.log(`https://mumbai.polygonscan.com/tx/${txhash}`);
            });
        await swap_tx.wait()

        // Grant our contract USDC allowance for the converted amount
        const fundraiseAllowance = await usdc.connect(signer).approve(CONTRACT_ADDRESS, amount)
        await fundraiseAllowance.wait()

        // Call our contract to deposit amount

        // Call our contract to invest
        authedBackendRequest('api/invest_in_project', {
            'project_id': project_id,
            'amount': amount,
        })

        // On success popup share window
        // });


    }

    useLayoutEffect(() => {
        listProjects()
        if (firstUpdate.current && user) {
            checkIfUserVerified()
            firstUpdate.current = false;
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    return (
        <>
            <button onClick={() => investInProject('something', 100000, '')}>swap</button>
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
            <Grid container rowSpacing={5} columnSpacing={2} sx={{ width: '100%', pl: 7, pt: 7 }}>
                <Grid item xs={12} container justifyContent="flex-start">
                    <Typography sx={{ pl: 1, fontSize: '22px', fontWeight: 500, }}>
                        Projects Review
                    </Typography>
                </Grid>
                <Grid item xs={6} container justifyContent="flex-start">
                    <OutlinedInput
                        label=""
                        size="small"
                        placeholder="  Search Companies"
                        sx={{ pl: 1, borderRadius: 4, width: '60%' }}
                        startAdornment={
                            <InputAdornment position="end">
                                <SearchIcon />
                            </InputAdornment>
                        }
                    />
                </Grid>
                <Grid item xs={6} container justifyContent="flex-start" alignItems={"center"}>
                    <Typography sx={{ pl: 1, fontSize: '16px', fontWeight: 500, }}>
                        Filters:
                    </Typography>
                    <OutlinedInput
                        label=""
                        value=" Category (1)"
                        size="small"
                        sx={{ ml: 2, pl: 1, borderRadius: 4, width: '40%' }}
                        startAdornment={
                            <InputAdornment position="end">
                                <FilterListIcon />
                            </InputAdornment>
                        }
                    />
                </Grid>
                {
                    Object.keys(projects).map(key =>
                        <ProjectCard key={key} project={projects[key]} />
                    )
                }
            </Grid>
        </>
    )
}

type InvestProject = {
    projectId: string
    investAmount: number
    investCoin: string
}

function ProjectCard(props: {
    project: any
}) {
    const [investInput, setInvestInput] = useState<InvestProject>({
        projectId: '',
        investAmount: 0,
        investCoin: 'ETH',
    });
    return (
        <Grid item xs={6} container justifyContent="flex-start">
            <Box
                sx={{
                    width: '90%',
                    minHeight: 300,
                    backgroundColor: '#fcfcfb',
                    m: 0,
                    mt: 4,
                    pb: 4,
                    alignItems: 'center',
                    borderRadius: 2,
                }}
                boxShadow={3}
            >
                <Toolbar>
                    <img src={require("../images/logo.png")} alt={'logo'} />
                    <Typography align='center' sx={{
                        ml: 1
                    }}>
                        {props.project.name}
                    </Typography>
                </Toolbar>
                <Typography className="item-body" align='left'
                    sx={{
                        color: '#515151',
                        fontFamily: 'Montserrat',
                        fontSize: '15px',
                        fontWeight: 300,
                        pl: 3,
                    }} >
                    {props.project.description}
                </Typography>

                <Box
                    sx={{
                        width: '90%',
                        minHeight: 150,
                        backgroundColor: '#fcfcfb',
                        m: 1,
                        ml: 3,
                        border: '1px dashed grey',
                        mt: 4,
                        alignItems: '',

                    }}
                >

                </Box>

                <Typography className="item-body" align='left'
                    sx={{
                        color: '#515151',
                        fontFamily: 'Montserrat',
                        fontSize: '16px',
                        fontWeight: 500,
                        pl: 3,
                        mt: 3,
                    }} >
                    Invest*
                </Typography>
                <Box
                    sx={{
                        width: '90%',
                        m: 1,
                        ml: 3,
                        justifyContent: "space-between",
                    }}
                >
                    <TextField
                        placeholder='Enter Amount'
                        sx={{

                            justifyContent: "space-between",
                        }}
                        value={investInput.investAmount}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        size="small"
                        onChange={evt => {
                            setInvestInput({ ...investInput, investAmount: parseInt(evt.target.value, 0) })
                        }} />
                    <Select
                        sx={{
                            width: '35%',
                            color: '#6634F3',
                            ml: 1,
                        }}
                        value={investInput.investCoin}
                        onChange={evt => {
                            setInvestInput({ ...investInput, investCoin: evt.target.value })
                        }}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        size="small"
                    >
                        <MenuItem value={'BTC'}>BTC</MenuItem>
                        <MenuItem value={'ETH'}>ETH</MenuItem>
                        <MenuItem value={'DAI'}>DAI</MenuItem>
                        <MenuItem value={'USDC'}>USDC</MenuItem>
                    </Select>
                </Box>
                <Button
                    variant="contained"
                    sx={{
                        width: '90%',
                        ml: 3,
                        mt: 4,
                        borderRadius: 2,
                        backgroundColor: '#6634F3',
                    }}
                    onClick={() => {
                        console.log(JSON.stringify(investInput));
                    }}
                >
                    Confirm
                </Button>
            </Box>
        </Grid>
    );
}
