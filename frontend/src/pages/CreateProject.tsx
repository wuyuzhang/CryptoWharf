import React, { useState } from "react";
import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

import { Button, FormControl } from '@mui/material';
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



type FormInput = {
    projectName: string
    category: string
    whyInvest: string
    stage: string
    target: string
}

function Form() {
    const [image, setImage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const [formInput, setFormInput] = useState<FormInput>({
        projectName: '',
        category: '',
        whyInvest: '',
        stage: '',
        target: ''
    });
    const onSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
        <Alert onClose={() => { }}>
            Congratulations! Your project is submitted successfully!
        </Alert>
        // call backend
        // formInput.projectName
    };
    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setImage(URL.createObjectURL(event.target.files[0]));
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
                            <InputWithTitle id="project-name" />
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} container justifyContent="flex-start">
                        <FormControl fullWidth variant="standard">
                            <InputLabel shrink htmlFor="bootstrap-input">
                                Category *
                            </InputLabel>
                            <Select
                                labelId="demo-select-small"
                                id="demo-select-small"
                                value={'Defi'}
                                label="Category"
                                sx={{ padding: '10px 12px' }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
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
                            <InputLabel shrink htmlFor="bootstrap-input">
                                Tell Others Why This Project Is A Good Investment *
                            </InputLabel>
                            <InputWithTitle multiline rows={4} id="project-name" />
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
                                value={'Defi'}
                                label="Stage"
                                sx={{ padding: '10px 12px' }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
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
                                labelId="stag"
                                id="demo-select-small"
                                value={'Defi'}
                                label="Category"
                                sx={{ padding: '10px 12px' }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
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
                                    backgroundColor: '#fcfcfb',
                                    m: 1,
                                    border: 1,
                                    borderColor: '#3F3F3F',
                                    borderStyle: 'dashed',
                                    mt: 4,
                                }}
                            >
                                {image !== '' &&
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
                                variant="outlined"
                                onClick={() => {
                                    setShowSuccess(true);
                                }}
                            >
                                Submit
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
                <Box sx={{ color: 'white', fontSize: 12, fontWeight: 'medium', pt: 2 }}>
                    Wallet connected:
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