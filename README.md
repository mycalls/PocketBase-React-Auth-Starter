# PocketBase React Auth Starter

Authentication starter built with **PocketBase**, **React**, **Vite**, **TanStack Router**, and **Tailwind CSS**.
It demonstrates:

- **Identity/Password**: Standard email/password sign-in and sign-up.
- **Email OTP (One-Time Password)**: Passwordless sign-in using a temporary code sent to the user's email.
- **OAuth2**: Seamless sign-in with various social identity providers (e.g., Google, GitHub, etc.).
- **MFA (Multi-factor Authentication)**: Enhanced security requiring a second authentication step after a successful password-based login.

> [!IMPORTANT]
>
> - Download the appropriate [PocketBase release](https://pocketbase.io/docs/) for your platform and place the executable inside the project’s `./pocketbase/` folder.
> - **MFA** in this project is fixed to **Identity/Password (factor 1) + Email OTP (factor 2)**.
>   MFA will only work when **both Password and Email OTP are enabled** in PocketBase.
> - **Email OTP** requires a working **SMTP** configuration in PocketBase.
> - **OAuth2** requires provider configuration in PocketBase (client ID/secret + allowed redirect URLs).

## Tech stack

- **Frontend:** React 18, Vite, TanStack Router, Tailwind CSS
- **Auth & backend:** PocketBase JavaScript SDK (talking to a PocketBase server)

## Getting started

- Clone the PocketBase-React-Auth-Starter
  repository and initialize it.

```sh
git clone https://github.com/mycalls/PocketBase-React-Auth-Starter.git
```

- Download the appropriate [PocketBase release](https://pocketbase.io/docs/) for your platform and place the executable inside the project’s `./pocketbase/` folder.

```sh
cd pocketbase-react-auth
```

```sh
./pocketbase/pocketbase serve
```

- Open the Dashboard address in your browser. (e.g., http://127.0.0.1:8090/_/)
- Create an Admin account, then add your desired settings ([SMTP](https://pocketbase.io/docs/going-to-production/#use-smtp-mail-server), [OAuth2](https://pocketbase.io/docs/authentication/#authenticate-with-oauth2), [MFA](https://pocketbase.io/docs/going-to-production/#enable-mfa-for-superusers)).

```sh
npm run dev
```

- Open the Local address in your browser. (e.g., http://localhost:5173/)

## Contributing

Feel free to open issues or submit pull requests. Any feedback and contributions are welcome\!
