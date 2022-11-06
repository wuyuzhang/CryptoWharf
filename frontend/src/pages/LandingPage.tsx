import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, Typography } from '@mui/material';
// @ts-ignore
import { useUserContext } from '../context/UserContext.tsx';
import { Link } from 'react-router-dom'
import Grid from '@mui/material/Grid';

declare var require: any

const css = `
  .title {
    font-size: 22px;
    font-weight: 500;
    margin-bottom: 8px;
  }
.item-body {
    color: #515151;
    font-family: 'Montserrat', sans-serif;
    font-size: 15px;
    font-weight: 300;
  }
  .item-title {
    color: #3F3F3F;
    font-size: 18px;
    font-weight: 400;
    margin-bottom: 20px;
  }
        `
function NavButton(props: { pageLink: string; pageName: string; text: string }) {
    const { setPage } = useUserContext()

    return (
        <Link to={props.pageLink}
            onClick={() => {
                setPage(props.pageName);
            }}
            style={{ textDecoration: 'none', }}
        >
            <Button
                variant="outlined"
                sx={{
                    ml: 3, borderColor: 'white', color: 'white', radius: 4,
                    '&:hover': {
                        borderColor: 'white',
                        backgroundColor: '#9328FF',
                    }
                }}
            >
                {props.text}
            </Button>
        </Link>);
}
export default function LandingPage() {

    const TextGrid = (
        <Grid item xs={6} flexDirection="column" alignItems="self-start" container justifyContent="center" >
            <div className="item-title">Safe and Fast</div>
            <Typography className="item-body" align='left' >
                We built and support a powerful and
                practical fundraising platform that is intuitively easy to use for donors.
            </Typography>
        </Grid>);

    return (
        <>
            <style>
                {css}
            </style>
            <Box
                sx={{
                    height: 300,
                    background: 'radial-gradient(at 0% 90%, #9328FF, #4A3AFF 57%)',
                }}
            >
                <Box sx={{ color: 'white', fontSize: 34, fontWeight: 'medium', pt: 10 }}>
                    FUNDRAISE IN CRYPTO EASILY
                </Box>
                <Box sx={{ color: 'white', fontSize: 34, fontWeight: 'medium', pt: 3 }}>
                    <NavButton pageLink='/projects' pageName='Projects' text='View Project' />
                    <NavButton pageLink='/onboarding' pageName='Onboarding' text='Upload Project' />
                </Box>
            </Box >
            <Grid container spacing={2} sx={{ mt: 7, ml: 5, pr: 10 }} >
                <Grid item xs={12} container justifyContent="flex-start">
                    <div className="title">Why use Crypto Wharf?</div>
                </Grid>
                {TextGrid}
                {TextGrid}

                <Grid item xs={6} container justifyContent="flex-start" sx={{ mt: 3 }}>
                    <img
                        width={'90%'}
                        height={306}
                        alt={"frame"}
                        src={require("../images/frame.png")}
                    />

                </Grid>
                {TextGrid}
            </Grid>
        </>
    );
}