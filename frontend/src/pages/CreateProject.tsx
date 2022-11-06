import React, { useRef, useState } from "react";
import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

import { Button, FormControl, Typography } from '@mui/material';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
// @ts-ignore
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
// @ts-ignore
import { useUserContext } from '../context/UserContext.tsx';
import { Category } from "@mui/icons-material";


type FormInput = {
    projectName: string
    category: string
    whyInvest: string
    stage: string
    targetAmount: number
    targetCoin: string
    videoAddress: string
}

function Form() {
    const { user } = useUserContext();
    const [image, setImage] = useState('');
    const [video, setVideo] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const [formInput, setFormInput] = useState<FormInput>({
        projectName: '',
        category: '',
        whyInvest: '',
        stage: '',
        targetAmount: 0,
        targetCoin: '',
        videoAddress: '',
    });

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
        } else {
            return  // return null for failed requests
        }
    }

    const onSubmit = async () => {
        await backendRequest("/api/create_project", {
            "user_uuid": user.user_uuid,
            "auth_token": user.auth_token,
            "name": formInput.projectName,
            "category": formInput.category,
            "logo_url": "https://www.google.com/imgres?imgurl=https://pbs.twimg.com/profile_images/1333830155287097349/rGY9wviF_400x400.jpg&imgrefurl=https://mobile.twitter.com/ethglobal&tbnid=V1NM65UzFeSabM&vet=1&docid=F8R2PUctRxpgzM&w=400&h=400&source=sh/x/im",
            "description": formInput.whyInvest,
            "stage": formInput.stage,
            "coin": formInput.targetCoin,
            "target": 8000000
        })

        await backendRequest("/api/create_profile", {
            "user_uuid": user.user_uuid,
            "auth_token": user.auth_token,
            "email": "cryptowharfsf@gmail.com",
            "telegram": "YZ233333"
        })

        setShowSuccess(true);

    };
    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setImage(URL.createObjectURL(event.target.files[0]));
        }
    }

    const onVideoChange = async (event) => {
        if (event.target.files && event.target.files[0]) {
            const address = await backendRequest("/api/get_upload_video_url", {
                "filename": event.target.files[0].name
            })
            setVideo(address['url']);
            setFormInput({ ...formInput, videoAddress: address });
        }
    }
    const InputWithTitle = styled(InputBase)(({ theme }) => ({
        'label + &': {
            marginTop: theme.spacing(3),
        },
        '& .MuiInputBase-input': {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
            border: '1px solid #ced4da',
            fontSize: 16,
            width: '100%',
            padding: '10px 12px',
            transition: theme.transitions.create([
                'border-color',
                'background-color',
                'box-shadow',
            ]),


            // Use the system font instead of the default Roboto font.
            fontFamily: [
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
            ].join(','),
            '&:focus': {
                boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
                borderColor: theme.palette.primary.main,
            },
        },
    }));
    console.log(video);
    return (
        <Box
            component="form"
            noValidate
            autoComplete="off"
        >
            <FormControl fullWidth variant="standard">
                <Grid container rowSpacing={5} columnSpacing={5} sx={{ pr: 5 }}>
                    <Grid item xs={6} container justifyContent="flex-start">
                        <FormControl fullWidth variant="standard">
                            <InputLabel shrink htmlFor="bootstrap-input">
                                My Project Name Is *
                            </InputLabel>
                            <InputWithTitle id="project-name"
                                value={formInput.projectName}
                                onChange={evt => {
                                    setFormInput({ ...formInput, projectName: evt.target.value })
                                }} />
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} container justifyContent="flex-start">
                        <FormControl fullWidth variant="standard">
                            <InputLabel shrink htmlFor="bootstrap-input">
                                Category *
                            </InputLabel>
                            <Select
                                labelId="category"
                                id="category"
                                value={formInput.category}
                                label="Category"
                                sx={{ padding: '10px 12px' }}
                                onChange={evt => {
                                    setFormInput({ ...formInput, category: evt.target.value })
                                }}
                            >
                                <MenuItem value={'DAO'}>DAO</MenuItem>
                                <MenuItem value={'DeFi'}>DeFi</MenuItem>
                                <MenuItem value={'GameFi'}>GameFi</MenuItem>
                                <MenuItem value={'NFT'}>NFT</MenuItem>
                                <MenuItem value={'SocialFi'}>SocialFi</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} container justifyContent="flex-start">
                        <FormControl fullWidth variant="standard">
                            <InputLabel shrink htmlFor="why-invest">
                                Tell Others Why This Project Is A Good Investment *
                            </InputLabel>
                            <InputWithTitle multiline rows={4} id="why-invest"
                                value={formInput.whyInvest}
                                onChange={evt => {
                                    setFormInput({ ...formInput, whyInvest: evt.target.value })
                                }} />
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} container justifyContent="flex-start">
                        <FormControl fullWidth variant="standard">
                            <InputLabel shrink htmlFor="stage">
                                Current Stage Of My Company*
                            </InputLabel>
                            <Select
                                labelId="stage"
                                id="stage"
                                value={formInput.stage}
                                label="Stage"
                                sx={{ padding: '10px 12px' }}
                                onChange={evt => {
                                    setFormInput({ ...formInput, stage: evt.target.value })
                                }}
                            >
                                <MenuItem value={'PreSeed'}>Pre-Seed</MenuItem>
                                <MenuItem value={'Seed'}>Seed</MenuItem>
                                <MenuItem value={'EearyStage'}>Early Stage</MenuItem>
                                <MenuItem value={'GrowthStage'}>Growth Stage</MenuItem>
                                <MenuItem value={'Expansion'}>Expansion Phase</MenuItem>
                                <MenuItem value={'Exit'}>Exit Phase</MenuItem>

                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} container justifyContent="flex-start">
                        <FormControl fullWidth variant="standard">
                            <InputLabel shrink htmlFor="bootstrap-input">
                                I Target To Raise *
                            </InputLabel>
                            <Select
                                labelId="coin"
                                id="demo-select-small"
                                value={formInput.targetCoin}
                                label="Category"
                                sx={{ padding: '10px 12px' }}
                                onChange={evt => {
                                    setFormInput({ ...formInput, targetCoin: evt.target.value })
                                }}
                            >
                                <MenuItem value={'BTC'}>BTC</MenuItem>
                                <MenuItem value={'ETH'}>ETH</MenuItem>
                                <MenuItem value={'MATIC'}>MATIC</MenuItem>
                                <MenuItem value={'USDC'}>USDC</MenuItem>

                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} container justifyContent="flex-start">
                        <FormControl fullWidth variant="standard">
                            <InputLabel shrink htmlFor="bootstrap-input">
                                Upload Your Project Logo
                            </InputLabel>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="raised-button-file"
                                type="file"
                                onChange={onImageChange}
                            />

                            <Box
                                sx={{
                                    width: '40%',
                                    minHeight: 100,
                                    backgroundColor: '#fcfcfb',
                                    m: 1,
                                    border: '1px dashed grey',
                                    mt: 4,
                                }}
                            >
                                {image === '' ? <Typography align='center' sx={{
                                    backgroundColor: '#fcfcfb',
                                    pt: 5,
                                }}>
                                    Logo Preview
                                </Typography> :
                                    <img src={image} width={'100%'}
                                        alt="preview image" />}
                            </Box>
                            <label htmlFor="raised-button-file" align='start'>
                                <Button component="span">
                                    Upload Logo
                                </Button>
                            </label>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} container justifyContent="flex-start">
                    </Grid>
                    <Grid item xs={12} container justifyContent="flex-start">
                        <FormControl fullWidth variant="standard">
                            <InputLabel shrink htmlFor="bootstrap-input">
                                Upload A Video To Better Introduce Your Project *
                            </InputLabel>
                            <input
                                style={{ display: 'none' }}
                                id="video"
                                type="file"
                                accept='video/mp4'
                                onChange={onVideoChange}
                            />

                            <Box
                                sx={{
                                    width: '60%',
                                    minHeight: 100,
                                    backgroundColor: '#fcfcfb',
                                    m: 1,
                                    border: '1px dashed grey',
                                    mt: 4,
                                }}
                            >
                                {video === '' ? <Typography align='center' sx={{
                                    backgroundColor: '#fcfcfb',
                                    pt: 5,
                                }}>
                                    Video Preview
                                </Typography> :
                                    <Typography align='center'
                                        sx={{
                                            backgroundColor: '#fcfcfb',
                                            pt: 2,
                                            pl: 1,
                                            pr: 1,
                                            pb: 2,
                                            fontSize: '10px',
                                            wordBreak: "break-all"
                                        }}>
                                        LivePeer Upload URL: {video}
                                    </Typography>}
                            </Box>
                            <label htmlFor="video" align='start'>
                                <Button component="span">
                                    Upload Video
                                </Button>
                            </label>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} container justifyContent="center">
                        <Box sx={{ width: '80%' }}>
                            <Collapse in={showSuccess}>
                                <Alert
                                    action={
                                        <IconButton
                                            aria-label="close"
                                            color="inherit"
                                            size="small"
                                            onClick={() => {
                                                setShowSuccess(false);
                                            }}
                                        >
                                            <CloseIcon fontSize="inherit" />
                                        </IconButton>
                                    }
                                    sx={{ mb: 2 }}
                                >
                                    Congratulations! Your project is submitted successfully!
                                </Alert>
                            </Collapse>

                            <Button
                                disabled={showSuccess}
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: '#6634F3',
                                }}
                                variant="contained"
                                onClick={() => {
                                    onSubmit();
                                    console.log(JSON.stringify(formInput));
                                }}
                            >
                                Start Fundraising
                            </Button>
                        </Box>

                    </Grid>
                </Grid>
            </FormControl>
        </Box>
    );
}


export default function CreateProject() {
    return (
        <>
            <Box
                justifyContent={'center'}
                sx={{
                    height: 1,
                    pb: 10,
                    background: 'radial-gradient(at 0% 90%, #9328FF, #4A3AFF 57%)',
                }}
            >
                <Box sx={{ color: 'white', fontSize: 24, fontWeight: 'medium', pt: 8 }}>
                    Start your fundraising in 2 minutes
                </Box>

                <Box
                    sx={{
                        ml: '6%',
                        mr: '6%',
                        mt: 5,
                        pt: 5,
                        pb: 5,
                        pl: 5,
                        height: '20%',
                        background: 'white',
                        borderRadius: 2,
                    }}
                    justifyContent={'center'}
                >
                    <Form />
                </Box>
            </Box>
        </>
    );
}