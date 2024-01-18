import NextAuth, { NextAuthOptions } from 'next-auth';
import AzureProvider from 'next-auth/providers/azure-ad';

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    AzureProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: { params: { scope: 'openid profile user.Read email' } },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.Console;
      session.user.idToken = token.idToken as string | undefined;
      session.user.accessToken = token.accessToken as string | undefined;

      return session;
    },
    async jwt({ token, account }) {
      // IMPORTANT: Persist the access_token to the token right after sign in
      if (account) {
        token.idToken = account.id_token;
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
