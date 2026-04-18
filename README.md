# Spider Agency

Static agency website for Spider Agency.

## Run locally

Install dependencies first:

```powershell
npm install
```

Then start the local dev server:

Example:

```powershell
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173`.

## Update agency details

Edit the `siteConfig` object in `components.js` to change:

- Agency name
- Contact email
- Location
- Response time
- Optional booking URL

## Contact form behavior

The contact form is intentionally backend-free. When someone submits it:

1. The site validates the required fields.
2. It copies the inquiry text to the clipboard when the browser allows it.
3. It opens the visitor's email client with a prefilled `mailto:` draft to your agency email.

If you want server-side form delivery later, the contact section can be connected to a form backend without changing the rest of the site structure.
