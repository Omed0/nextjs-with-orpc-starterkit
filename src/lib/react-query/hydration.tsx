import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createQueryClient } from './client'
import { cache } from 'react'

export const getQueryClient = cache(createQueryClient)

export function HydrateClient(props: { children: React.ReactNode, client: QueryClient }) {
    return (
        <HydrationBoundary state={dehydrate(props.client)}>
            {props.children}
        </HydrationBoundary>
    )
}