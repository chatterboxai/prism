import { Amplify } from "aws-amplify";

// This function should be called on app initialization
export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
        loginWith: {
          email: true,
        },
      },
    },
  });
}
