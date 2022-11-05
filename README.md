# CryptoWharf

## Deploy CryptoWharf

### Deploy to firebase

Inside `CryptoWharf/`

(only the first time) `npm install -g firebase-tools`

(only the first time) `firebase login`

(only the first time) `firebase init` (select `hosting` `functions` `realtime_database`)

(only the first time) Revert local changes caused by `firebase init`

`firebase deploy`

#### Deploy backend only

`firebase deploy --only functions`