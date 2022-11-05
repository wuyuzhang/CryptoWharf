import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
// @ts-ignore
import ConnectWallet from './ConnectWallet.tsx';

declare var require: any

const menus = [
    { text: 'Features', href: '/features' },
    { text: 'Projects', href: '/projects' },
    { text: 'Support', href: '/support' },
];

export default function NavBar() {
    return (
        <AppBar color='transparent' position="static">
            <Toolbar>
                <img className="navbar-logo" src={require("../images/logo.png")} alt={'logo'} />

                <div className="navbar-name">CryptoWharf</div>

                <Box sx={{ flexGrow: 1, pl: 7, display: { xs: 'none', md: 'flex' } }}>
                    {menus.map(menu => (

                        <Button
                            key={menu.text}
                            variant={"text"}
                        >
                            {menu.text}
                        </Button>
                    ))}
                </Box>

                <ConnectWallet />
            </Toolbar>
        </AppBar >
    );
}