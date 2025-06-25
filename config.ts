import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "Invoices — Mil Hoornaert",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Stop paying 0.4% for Stripe invoices. Create unlimited invoice access links for your customers. Let them search, edit, and download invoices for free.",
  // REQUIRED (no https://, not trialing slash at the end)
  // This will respect the deployment URL (like Vercel) if no custom domain is set
  domainName: "invoice.milh.tech",
  // REQUIRED — the path to your favicon file
  faviconPath: "/favicon.ico",
  // REQUIRED: Your marketplace's logo
  logoPath: "/logo.png",
  // REQUIRED: The OG image used when someone shares your website on social media
  ogImagePath: "/opengraph-image.png",
  // GitHub repository URL for "Get Started" links
  githubRepo: "https://github.com/Kiog-Aser/invoices",
  // Optional: The Google Analytics measurement ID
  googleAnalytics: {
    measurementId: "",
  },

  crisp: {
    // Optional Crisp chat widget configuration
    id: undefined,
    onlyShowOnRoutes: [],
  },

  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    plans: [
      {
        name: "Basic",
        price: 19,
        priceId: "", // ADD YOUR STRIPE PRICE ID HERE
        description: "Perfect for individuals",
        features: [
          { name: "Basic features" },
          { name: "Email support" },
          { name: "1 project" },
          { name: "1 GB storage" }
        ]
      },
      {
        name: "Pro",
        price: 49,
        priceId: "", // ADD YOUR STRIPE PRICE ID HERE
        description: "Great for professionals",
        isFeatured: true,
        features: [
          { name: "All Basic features" },
          { name: "Priority support" },
          { name: "5 projects" },
          { name: "5 GB storage" },
          { name: "Advanced analytics" }
        ]
      }
    ]
  },

  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "",
    bucketUrl: `https://your-bucket-name.s3.amazonaws.com/`,
    cdn: "https://your-cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `InvoiceLink <noreply@mails.milh.tech>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `InvoiceLink <support@mails.milh.tech>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@mails.milh.tech",
    // When someone replies to supportEmail sent by the app, forward it to the email below (otherwise it's lost). If you set supportEmail to empty, this will be ignored.
    forwardRepliesTo: "your-email@example.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // Keep this as api/auth/signin to work with Google OAuth registration
    loginUrl: "/api/auth/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
