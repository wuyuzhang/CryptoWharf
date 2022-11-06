import { createContext, useContext } from "react"

export type UserContent = {
    page: string
    setPage: (page: string) => void
    user: any
    setUser: (user: any) => void
    signer: any
    setSigner: (user: any) => void
}

// default value
export const UserContext = createContext<UserContent>({
    page: 'features',
    setPage: () => { },
    user: null,
    setUser: () => { },
    signer: null,
    setSigner: () => { },
});

export const useUserContext = () => useContext(UserContext)