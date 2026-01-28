import type {
	GetServerSidePropsContext,
	InferGetServerSidePropsType,
} from "next"
import { getProviders, signIn } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]"
import { ReactElement } from "react"

function SignInPage({
	providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="flex flex-col bg-base-300 p-10 rounded-4xl items-center">
				{Object.values(providers).map((provider) => (
					<div key={provider.name} className="p-4">
						<button
							className="btn btn-primary btn-xl w-full px-12"
							onClick={() => signIn(provider.id)}
						>
							Sign in with {provider.name}
						</button>
					</div>
				))}
			</div>
		</div>
	)
}

SignInPage.getLayout = function getLayout(page: ReactElement) {
	return <div className="flex flex-col h-screen min-w-screen">{page}</div>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerSession(
		context.req,
		context.res,
		authOptions,
	)

	if (session) {
		return { redirect: { destination: "/" } }
	}

	const providers = await getProviders()

	return {
		props: { providers: providers ?? [] },
	}
}

export default SignInPage
