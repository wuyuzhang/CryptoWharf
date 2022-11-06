import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { Typography, Grid } from '@mui/material';


export function WalletSummary(props) {
    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            PaperProps={{ sx: { borderRadius: 4, position: "fixed", top: 30, right: 50, m: 0, width: "27%", height: 420 } }}
        >
            <DialogTitle>
                <Typography sx={{ pl: 1, fontSize: '22px', fontWeight: 500, }}>
                    Treasury
                </Typography>
                <Typography sx={{ pl: 1, fontSize: '12px', fontWeight: 500, }}>
                    chcharcharlie.eth
                </Typography>
            </DialogTitle>
            <Grid container sx={{ width: '100%', height: '100%' }}>
                <Grid item xs={12}>

                    <Box
                        sx={{
                            width: '100%',
                            height: 160,
                            backgroundColor: '#533CEA',
                            alignItems: 'center',
                            pl: 3,
                        }}
                    >

                        <Typography sx={{ pl: 1, pt: 4, fontSize: '16px', fontWeight: 500, color: 'white' }}>
                            Total Funds Raised
                        </Typography>
                        <Typography sx={{ pl: 1, fontSize: '32px', fontWeight: 500, color: 'white' }}>
                            $500,000 USD
                        </Typography>
                        <Typography sx={{ pl: 1, fontSize: '12px', fontWeight: 500, color: 'white' }}>
                            Earning 5% APY
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box
                        sx={{
                            width: '100%',
                            height: 160,
                            backgroundColor: '#0E8867',
                            mb: 7,
                            pl: 3,
                        }}
                    >
                        <Typography sx={{ pl: 1, pt: 4, fontSize: '16px', fontWeight: 500, color: 'white' }}>
                            Available Balance
                        </Typography>
                        <Typography sx={{ pl: 1, fontSize: '32px', fontWeight: 500, color: 'white' }}>
                            $26,324 USD
                        </Typography>
                        <Typography sx={{ pl: 1, fontSize: '12px', fontWeight: 500, color: 'white' }}>
                            Streaming $10,000/month
                        </Typography>
                    </Box>
                </Grid>

            </Grid>
        </Dialog>
    );
}