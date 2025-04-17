import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "CreatiFun",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Create a structured writing protocol that eliminates frustration and delivers results. Stop the endless content struggle.",
  // REQUIRED (no https://, not trialing slash at the end)
  // This will respect the deployment URL (like Vercel) if no custom domain is set
  domainName: process.env.VERCEL_URL || "systems-ai.vercel.app",
  // REQUIRED — the path to your favicon file
  faviconPath: "/favicon.ico",
  // REQUIRED: Your marketplace's logo
  logoPath: "/logo.png",
  // REQUIRED: The OG image used when someone shares your website on social media
  ogImagePath: "/opengraph-image.png",
  // Optional: The Google Analytics measurement ID
  googleAnalytics: {
     measurementId: "G-YZLD2B6FQ3",
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
        name: "Single Protocol",
        price: 39,
        priceId: "price_1RBLRmG19CrUMKRawDhN6cXJ",
        description: "Perfect for individuals",
        features: [
          { name: "1 complete writing protocol" },
          { name: "Content pillars & topic ideas" },
          { name: "Weekly content calendar" },
          { name: "Content creation frameworks" }
        ]
      },
      {
        name: "Unlimited Access",
        price: 159,
        priceId: "price_1RBLRiG19CrUMKRaaun6VaCZ",
        description: "One-time payment, lifetime access",
        isFeatured: true,
        features: [
          { name: "Unlimited writing protocols" },
          { name: "Advanced customization options" },
          { name: "Content repurposing system" },
          { name: "Priority support" },
          { name: "All future updates included" }
        ]
      }
    ]
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
    fromNoReply: `CreatiFun <noreply@mg.systems-ai.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Support at CreatiFun <support@mg.systems-ai.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@mg.systems-ai.com",
    // When someone replies to supportEmail sent by the app, forward it to the email below (otherwise it's lost). If you set supportEmail to empty, this will be ignored.
    forwardRepliesTo: "milloranh@gmail.com",
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
