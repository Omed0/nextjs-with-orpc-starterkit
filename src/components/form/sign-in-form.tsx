"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { authClient } from "@/lib/auth-client"
import type { ErrorContext } from "better-auth/react"

const formSchema = z.object({
	email: z.email("Please enter a valid email address."),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters.")
		.max(100, "Password must be at most 100 characters."),
	rememberMe: z.boolean(),
})

export default function SignIn() {
	const t = useTranslations('auth');
	const [loading, setLoading] = React.useState(false)
	const [socialLoading, setSocialLoading] = React.useState(false)

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			rememberMe: false,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
					rememberMe: value.rememberMe,
					callbackURL: "/dashboard",
				},
				{
					onRequest: () => {
						setLoading(true)
					},
					onResponse: () => {
						setLoading(false)
					},
					onError: (context: ErrorContext) => {
						toast.error(
							context.error.message || "Something went wrong. Please try again."
						)
					},
					onSuccess: () => {
						toast.success("Logged in successfully")
					}
				}
			)
		},
	})

	const handleSocialLogin = async (provider: "google" | "github") => {
		await authClient.signIn.social(
			{
				provider,
				callbackURL: "/dashboard",
			},
			{
				onRequest: () => {
					setSocialLoading(true)
				},
				onResponse: () => {
					setSocialLoading(false)
				},
				onError: (ctx) => {
					toast.error(ctx.error.message)
				},
			}
		)
	}

	return (
		<Card className="w-md">
			<CardHeader>
				<CardTitle className="text-lg md:text-xl">{t('signIn')}</CardTitle>
				<CardDescription className="text-xs md:text-sm">
					{t('signInDescription')}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="sign-in-form"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<FieldGroup>
						<form.Field
							name="email"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>{t('email')}</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="email"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="m@example.com"
											autoComplete="email"
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								)
							}}
						/>
						<form.Field
							name="password"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid
								return (
									<Field data-invalid={isInvalid}>
										<div className="flex items-center">
											<FieldLabel htmlFor={field.name}>{t('password')}</FieldLabel>
											<Link
												href="#"
												className="ml-auto inline-block text-sm underline"
											>
												{t('forgotPassword')}
											</Link>
										</div>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="password"
											autoComplete="current-password"
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								)
							}}
						/>
						<form.Field
							name="rememberMe"
							children={(field) => (
								<div className="flex items-center gap-2">
									<Checkbox
										id="remember"
										checked={field.state.value}
										onCheckedChange={(checked) =>
											field.handleChange(checked === true)
										}
									/>
									<FieldLabel htmlFor="remember">{t('rememberMe')}</FieldLabel>
								</div>
							)}
						/>
						<Button
							type="submit"
							className="w-full"
							disabled={loading || socialLoading}
						>
							{loading ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								t('signIn')
							)}
						</Button>
						<div className="w-full flex items-center gap-4">
							<Button
								type="button"
								variant="outline"
								className="gap-2 flex-1"
								disabled={loading || socialLoading}
								onClick={() => handleSocialLogin("google")}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="0.98em"
									height="1em"
									viewBox="0 0 256 262"
								>
									<path
										fill="#4285F4"
										d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
									></path>
									<path
										fill="#34A853"
										d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
									></path>
									<path
										fill="#FBBC05"
										d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
									></path>
									<path
										fill="#EB4335"
										d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
									></path>
								</svg>
								Google
							</Button>
							<Button
								type="button"
								variant="outline"
								className="flex-1 gap-2"
								disabled={loading || socialLoading}
								onClick={() => handleSocialLogin("github")}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
								>
									<path
										fill="currentColor"
										d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
									></path>
								</svg>
								Github
							</Button>
						</div>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<div className="flex justify-center w-full border-t py-4">
					<p className="text-center text-sm text-neutral-500">
						<Link href="/sign-up" className="underline hover:text-primary/85">
							{t('noAccount')} {t('signUp')}
						</Link>
					</p>
				</div>
			</CardFooter>
		</Card>
	)
}