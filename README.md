# Alfred is the Admin Management platform of Excel MEC

AlfredV2 is a revamped version, rewritten in React of the existing Alfred repo (written in C#)

### Development

- Built with Vite, React and TypeScript, using Tailwind CSS v4 and shadcn/ui (Radix) with Phosphor icons and Plus Jakarta Sans
- Light and dark themes live in `src/index.css`; shadcn components are in `src/Components/ui`
- Package manager is yarn
- use `yarn install` to install dependencies
- create a `.env` file according to `.env.example` file
- start dev with `yarn dev` (or `yarn start`)

### Todo

- [x] Accounts
  - [x] Users List
  - [x] Users Role Edit
- [ ] Events
  - [x] Event CRUD
  - [x] Event Heads CRUD
  - [ ] Event Registrations
  - [ ] Event Results CRUD
  - [x] Event Schedule CRUD
  - [ ] Event HighLights CRUD
- [x] Campus Ambassador
  - [x] Ca CRUD
  - [x] Ca Team Crud
- [ ] Merchandise
  - [x] Item CRUD
  - [x] Test Checkout
  - [ ] Order List
  - [ ] Order Status Updates
- [ ] Mailer
- [ ] Certificates
