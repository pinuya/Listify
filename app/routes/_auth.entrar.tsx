import { useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { Label } from "@radix-ui/react-label"
import type { ActionFunctionArgs } from "@remix-run/node"
import { Form, Link, json, redirect, useActionData } from "@remix-run/react"
import { z } from "zod"
import { Login } from "~/assets/images"
// import { Login } from "~/assets/images"
// import { Footer } from "~/components/Footer"
import { Button } from "~/components/ui/button"
import { createSupabaseServerClient } from "~/services/supabase.server"

const loginSchema = z.object({
	email: z
		.string({ message: "Campo obrigatorio." })
		.email({ message: "E-mail invalido." }),
	password: z
		.string({ message: "Campo obrigatorio." })
		.min(8, { message: "Senha tem que ter no minimo 8 caracteres." }),
})

export const action = async (args: ActionFunctionArgs) => {
	const formData = await args.request.formData()
	//TODO: pegar os itens do form, validar e login
	const submission = parseWithZod(formData, { schema: loginSchema })

	if (submission.status !== "success") {
		return json(submission.reply())
	}

	const { headers, supabaseClient } = createSupabaseServerClient(args.request)
	const { email, password } = submission.value
	const { error, data } = await supabaseClient.auth.signInWithPassword({
		email,
		password,
	})

	if (error) {
		return json(
			submission.reply({
				fieldErrors: {
					email: ["email ou senha incorretos."],
					password: ["email ou senha incorretos."],
				},
			}),
		)
	}

	return redirect("/home", {
		headers,
	})
}

export default function SignIn() {
	const lastResult = useActionData<typeof action>()

	const [form, fields] = useForm({
		// Sync the result of last submission
		lastResult,

		// Reuse the validation logic on the client
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: loginSchema })
		},

		// Validate the form on blur event triggered
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	})

	return (
		<div className="flex-col gap-4 h-screen items-center justify-center md:grid lg:max-none lg:grid-cols-2">
			<div className="container">
				<div className="p-4 mr-4 rounded-xl border bg-card text-card-foreground shadow mx-auto flex w-full flex-col justify-center space-y-6">
					<div className="flex flex-col space-y-2 text-center p-6">
						<div className="text-2xl font-semibold tracking-tight">
							Faça o seu login.
						</div>
						<div className="text-sm text-muted-foreground">
							Entre com seu e-mail e senha abaixo
						</div>
					</div>

					<div className="grid gap-6">
						<Form
							method="POST"
							className="grid gap-2"
							id={form.id}
							onSubmit={form.onSubmit}>
							<Label htmlFor="email">E-mail</Label>
							<input
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								type="email"
								placeholder="example@example.com"
								key={fields.email.key}
								name={fields.email.name}
								defaultValue={fields.email.initialValue}
							/>
							<p>{fields.email.errors}</p>
							<Label htmlFor="password">Senha</Label>
							<input
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								type="password"
								key={fields.password.key}
								name={fields.password.name}
								defaultValue={fields.password.initialValue}
							/>
							<p>{fields.password.errors}</p>
							<Button type="submit" className="bg-foreground">
								Entrar
							</Button>
							<Link
								className="text-sm text-muted-foreground hover:underline"
								to={"/cadastrar"}>
								Ainda não possui uma conta? Cadastre-se!
							</Link>
						</Form>
					</div>
				</div>
			</div>

			<img className="h-full w-full object-fill" src={Login} alt="create img" />
		</div>
	)
}
