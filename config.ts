import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "NotiFast",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Increase conversions with 'fake' notifications. Use our pre-built templates or create your own.",
  // REQUIRED (no https://, not trialing slash at the end)
  domainName: "notifast.co",
  // REQUIRED — the path to your favicon file
  faviconPath: "/favicon.ico",
  // REQUIRED: Your marketplace's logo
  logoPath: "/logo.png",
  // REQUIRED: The OG image used when someone shares your website on social media
  ogImagePath: "/og-image.png",
  // Optional: The Google Analytics measurement ID
  // googleAnalytics: {
  //   measurementId: "G-XXXXXXXXXX",
  // },

  // Optional: If you need to have Stripe, Stripe products, and pricing plans.
  stripe: {
    // See https://stripe.com/docs/keys
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    // These are entirely optional
    plans: [
      {
        name: "Free",
        price: 0, // $0.00 USD
      },
      {
        name: "Pro Lifetime",
        price: 10,
        priceId: "price_1R0PNQIpDPy0JgwZ33p7CznT",
      },
    ],
  },

  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  mailgun: {
    // subdomain to use when sending emails, if you don't have a subdomain, just remove it. Highly recommended to have one (i.e. mg.yourdomain.com or mail.yourdomain.com)
    subdomain: "mg",
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `NotiFast <noreply@mg.notifast.co>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Marc at NotiFast <marc@mg.notifast.co>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "marc@mg.notifast.co",
    // When someone replies to supportEmail sent by the app, forward it to the email below (otherwise it's lost). If you set supportEmail to empty, this will be ignored.
    forwardRepliesTo: "marc.louvion@gmail.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/api/auth/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
