import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        session: async ({ session, user }) => {
            if (session?.user) {
                session.user.id = user.id
            }
            return session
        },
    },
    pages: {
        signIn: "/",
    },
    debug: process.env.NODE_ENV === 'development',
})

// Force Node.js runtime (not edge)
export const runtime = 'nodejs'

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
