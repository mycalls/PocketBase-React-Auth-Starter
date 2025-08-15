# PocketBase React Auth Starter

Authentication starter built with **PocketBase**, **React**, **Vite**, **TanStack Router**, and **Tailwind CSS**.
It demonstrates:

- **Identity/Password**: Standard email/password sign-in and sign-up.
- **Email OTP (One-Time Password)**: Passwordless sign-in using a temporary code sent to the user's email.
- **OAuth2**: Seamless sign-in with various social identity providers (e.g., Google, GitHub, etc.).
- **MFA (Multi-factor Authentication)**: Enhanced security requiring a second authentication step after a successful password-based login.

> [!IMPORTANT]
>
> - **Bundled PocketBase binary:** The binary included in this repo is **macOS ARM64 (Apple Silicon)**.
> - If you’re on **Windows** or **another OS/architecture**, download the appropriate [PocketBase release](https://pocketbase.io/docs/) for your platform and place the executable inside the project’s `./pocketbase/` folder (replacing the existing one).
> - **MFA** in this project is fixed to **Identity/Password (factor 1) + Email OTP (factor 2)**.
>   MFA will only work when **both Password and Email OTP are enabled** in PocketBase.
> - **Email OTP** requires a working **SMTP** configuration in PocketBase.
> - **OAuth2** requires provider configuration in PocketBase (client ID/secret + allowed redirect URLs).

## Tech stack

- **Frontend:** React 18, Vite, TanStack Router, Tailwind CSS
- **Auth & backend:** PocketBase JavaScript SDK (talking to a PocketBase server)

## Getting started

## 🤝 Contributing

Feel free to open issues or submit pull requests. Any feedback and contributions are welcome\!
