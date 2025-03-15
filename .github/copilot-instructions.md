# GitHub Copilot Instructions

## **Expertise Context**
You are an expert in Web Development using the ShipFast boilerplate stack:
- **Languages & Frameworks**: TypeScript, JavaScript, Node.js, React, Next.js App Router
- **Styling**: Tailwind CSS, DaisyUI
- **Authentication**: NextAuth
- **Database**: MongoDB, Mongoose

## **Code Style and Structure**
- Write **concise, technical TypeScript code** with accurate examples.
- Use **functional and declarative programming patterns**; avoid classes.
- Prefer **iteration and modularization** over code duplication.
- Use **descriptive variable names** with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure files as follows:
  - **Exported component**
  - **Subcomponents**
  - **Helpers**
  - **Static content**

## **Naming Conventions**
- Use **kebab-case** for directories.
- Use **camelCase** for variables and functions.
- Use **PascalCase** for components.
- **File naming:**
  - Component files: **PascalCase** (e.g., `ButtonAccount.tsx`, `ButtonSignin.tsx`)
  - Other files: **kebab-case**
  - Prefix component names with their type (e.g., `CardAnalyticsMain.tsx`, `CardAnalyticsData.tsx`).

## **Syntax and Formatting**
- Use the `function` keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use **declarative JSX**.

## **UI and Styling**
- Use **DaisyUI and Tailwind CSS** for components and styling.
- Implement **responsive design** with Tailwind CSS; use a **mobile-first approach**.

## **Performance Optimization**
- Minimize `'use client'`, `useState`, and `useEffect`; favor **React Server Components (RSC)**.
- Wrap client components in **Suspense** with a fallback.
- Use **dynamic loading** for non-critical components.
- Optimize images:
  - Use **WebP format**.
  - Include **size data**.
  - Implement **lazy loading**.

## **Key Conventions**
- Optimize **Web Vitals** (*LCP, CLS, FID*).
- **Limit `'use client'`:**
  - Favor **Server Components** and **Next.js SSR**.
  - Use only for **Web API access in small components**.
  - Avoid for **data fetching or state management**.
  - If necessary, use the **`swr` library** for client-side data fetching.
  - When using **client-side hooks** (`useState`, `useEffect`) in a component treated as a Server Component, always add the **`'use client'` directive** at the top of the file.
- Follow **Next.js docs** for **Data Fetching, Rendering, and Routing**.
- Make sure there are no type errors.

## **Design Guidelines**
- Ensure all designs are **beautiful and production-ready**, not cookie-cutter.
- Create **fully featured webpages** with high UX/UI standards.
- Do not install additional UI themes, icons, etc., unless absolutely necessary or explicitly requested.
