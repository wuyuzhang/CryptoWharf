import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
// @ts-ignore
import ConnectWallet from './ConnectWallet.tsx';
import { Link } from 'react-router-dom'

declare var require: any

const menus = [
    { text: 'Features', href: '/features' },
    { text: 'Projects', href: '/projects' },
    { text: 'Onboarding', href: '/onboarding' },
];

export default function NavBar() {
    return (
        <AppBar color='transparent' position="static">
            <Toolbar>
                <img src={require("../images/logo.png")} alt={'logo'} />

                <div >CryptoWharf</div>

                <Box sx={{ flexGrow: 1, pl: 7, display: { xs: 'none', md: 'flex' } }}>
                    {menus.map(menu => (
                        <Link to={menu.href}
                            key={menu.text}
                            style={{ textDecoration: 'none', }}
                        >
                            <Button
                                sx={{ my: 2, ml: 2, display: 'block' }}
                                key={menu.text}
                                variant="text"
                            >
                                {menu.text}
                            </Button>
                        </Link>
                    ))}
                </Box>

                <ConnectWallet />
            </Toolbar>
        </AppBar >
    );
}