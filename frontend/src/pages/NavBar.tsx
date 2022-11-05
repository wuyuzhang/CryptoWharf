import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
// @ts-ignore
import ConnectWallet from './ConnectWallet.tsx';
import { Link } from 'react-router-dom'
// @ts-ignore
import { useUserContext } from '../context/UserContext.tsx';

declare var require: any

const menus = [
    { text: 'Features', href: '/features' },
    { text: 'Projects', href: '/projects' },
    { text: 'Onboarding', href: '/onboarding' },
];

export default function NavBar() {
    const { page, setPage } = useUserContext()

    return (
        <AppBar color='transparent' position="static">
            <Toolbar>
                <img src={require("../images/logo.png")} alt={'logo'} />

                <div >CryptoWharf</div>

                <Box sx={{ flexGrow: 1, pl: 7, display: { xs: 'none', md: 'flex' } }}>
                    {menus.map(menu => (
                        <Link to={menu.href}
                            key={menu.text}
                            onClick={() => {
                                setPage(menu.text);
                            }}
                            style={{ textDecoration: 'none', }}
                        >
                            <Button
                                sx={{ my: 2, ml: 2, color: menu.text === page ? "white" : "black", display: 'block' }}
                                key={menu.text}
                                variant={menu.text === page ? "contained" : "text"}
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