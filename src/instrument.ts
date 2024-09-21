// import * as Sentry from "@sentry/nestjs"
// import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Sentry.init({
//     dsn: process.env.SENTRY_AUTH_DSN,
//     integrations: [
//         nodeProfilingIntegration(),
//         Sentry.nestIntegration(),
//         Sentry.mongooseIntegration(),
//     ],
//     enabled: process.env.NODE_ENV !== "development",
//     debug: process.env.NODE_ENV === "development",
//     tracesSampleRate: 1.0, //  Capture 100% of the transactions | decrease it when traffics go high
//     profilesSampleRate: 1.0,
// });
