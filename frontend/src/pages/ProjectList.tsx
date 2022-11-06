import React, { useState, useLayoutEffect, useRef } from 'react';
import { WorldIDWidget } from '@worldcoin/id'
import { useUserContext } from "../context/UserContext.tsx";

export default function ProjectList() {
    const { user } = useUserContext();
    const [userVerified, setUserVerified] = useState(true)
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

    async function listProjects(url = '', data = {}) {
        const projects = await backendRequest("/api/list_projects", {
            "user_uuid": user.user_uuid,
            "auth_token": user.auth_token
        })
        return projects
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

    useLayoutEffect(() => {
        if (firstUpdate.current && user) {
            checkIfUserVerified()
            firstUpdate.current = false;
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    return (
        <div>
            <h1>Project List</h1>
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
        </div>
    )
}