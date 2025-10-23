"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import Image from "next/image"
import { Loader2, X } from "lucide-react"
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
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

const formSchema = z
	.object({
		firstName: z
			.string()
			.min(2, "First name must be at least 2 characters.")
			.max(50, "First name must be at most 50 characters."),
		lastName: z
			.string()
			.min(2, "Last name must be at least 2 characters.")
			.max(50, "Last name must be at most 50 characters."),
		email: z
			.email("Please enter a valid email address."),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters.")
			.max(100, "Password must be at most 100 characters."),
		passwordConfirmation: z
			.string()
			.min(1, "Please confirm your password."),
		image: z.instanceof(File).nullable(),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "Passwords do not match.",
		path: ["passwordConfirmation"],
	})

export default function SignUp() {
	const t = useTranslations('auth');
	const [loading, setLoading] = React.useState(false)
	const [imagePreview, setImagePreview] = React.useState<string | null>(null)

	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			passwordConfirmation: "",
			image: null as File | null,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email({
				email: value.email,
				password: value.password,
				name: `${value.firstName.trim()} ${value.lastName.trim()}`,
				// image: value.image ? await convertImageToBase64(value.image) : "",
				callbackURL: "/dashboard",
				fetchOptions: {
					onRequest: () => {
						setLoading(true)
					},
					onResponse: () => {
						setLoading(false)
					},
					onSuccess: async () => {
						toast.success("Account created successfully!")
					},
				},
			})
		},
	})

	const handleImageChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		field: any
	) => {
		const file = e.target.files?.[0]
		if (file) {
			field.handleChange(file)
			const reader = new FileReader()
			reader.onloadend = () => {
				setImagePreview(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const clearImage = (field: any) => {
		field.handleChange(null)
		setImagePreview(null)
	}

	return (
		<Card className="rounded-md rounded-t-none w-md">
			<CardHeader>
				<CardTitle className="text-lg md:text-xl">{t('signUp')}</CardTitle>
				<CardDescription className="text-xs md:text-sm">
					{t('signUpDescription')}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="sign-up-form"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<FieldGroup>
						<div className="grid grid-cols-2 gap-4">
							<form.Field
								name="firstName"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>{t('firstName')}</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Max"
												autoComplete="given-name"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									)
								}}
							/>
							<form.Field
								name="lastName"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>{t('lastName')}</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Robinson"
												autoComplete="family-name"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									)
								}}
							/>
						</div>
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
										<FieldLabel htmlFor={field.name}>{t('password')}</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Password"
											autoComplete="new-password"
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								)
							}}
						/>
						<form.Field
							name="passwordConfirmation"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											{t('confirmPassword')}
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Confirm Password"
											autoComplete="new-password"
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								)
							}}
						/>
						<form.Field
							name="image"
							children={(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										{t('profileImage')}
									</FieldLabel>
									<div className="flex items-end gap-4">
										{imagePreview && (
											<div className="relative w-16 h-16 rounded-sm overflow-hidden">
												<Image
													src={imagePreview}
													alt="Profile preview"
													fill
													className="object-cover"
												/>
											</div>
										)}
										<div className="flex items-center gap-2 w-full">
											<Input
												id={field.name}
												name={field.name}
												type="file"
												accept="image/*"
												onChange={(e) => handleImageChange(e, field)}
												className="w-full"
											/>
											{imagePreview && (
												<X
													className="cursor-pointer"
													onClick={() => clearImage(field)}
												/>
											)}
										</div>
									</div>
									<FieldDescription>
										Upload a profile picture to personalize your account.
									</FieldDescription>
								</Field>
							)}
						/>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								t('signUp')
							)}
						</Button>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<div className="flex justify-center w-full border-t py-4">
					<p className="text-center text-sm text-neutral-500">
						<Link href="/sign-in" className="underline hover:text-primary/85">
							{t('haveAccount')} {t('signIn')}
						</Link>
					</p>
				</div>
			</CardFooter>
		</Card>
	)
}

