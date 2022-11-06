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

    const TextGrid1 = (
        <Grid item xs={6} flexDirection="column" alignItems="self-start" container justifyContent="center" >
            <div className="item-title">One stop platform</div>
            <Typography className="item-body" align='left' >
                CryptoWharf is a one stop platform for both founders and investors. Founders can easily reach out to potential investors across the globe. Investors have access to great projects without being in a high profile institution.
            </Typography>
        </Grid>);

    const TextGrid2 = (
        <Grid item xs={6} flexDirection="column" alignItems="self-start" container justifyContent="center" >
            <div className="item-title">Crypto friendly</div>
            <Typography className="item-body" align='left' >
                CryptoWharf supports fundraising and investment by multiple kinds of crypto. We also reduce your hassle by swapping to the target coin conveniently.
            </Typography>
        </Grid>);

    const TextGrid3 = (
        <Grid item xs={6} flexDirection="column" alignItems="self-start" container justifyContent="center" >
            <div className="item-title">Video pitch support</div>
            <Typography className="item-body" align='left' >
                Instead of doing the same pitch to tens of investors again and again, CryptoWharf allows you to record a pitch video and share with millions of people in one click.
            </Typography>
        </Grid>);

    const TextGrid4 = (
        <Grid item xs={6} flexDirection="column" alignItems="self-start" container justifyContent="center" >
            <div className="item-title">Social and legal</div>
            <Typography className="item-body" align='left' >
                Utilizing the NFT, CryptoWharf is able to help you record your investment permanently and share in your circle. We are also aiming to resolve legal issue by the usage of NFT.        </Typography>
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
                {TextGrid1}
                {TextGrid2}
                {TextGrid3}
                {TextGrid4}

                <Grid item xs={6} container justifyContent="flex-start" sx={{ mt: 3 }}>
                    <img
                        width={'90%'}
                        height={306}
                        alt={"frame"}
                        src={require("../images/frame.png")}
                    />

                </Grid>
                {TextGrid3}
            </Grid>
        </>
    );
}