"use client"

import { SearchIcon } from "lucide-react"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import Link from "next/link"


export default function VenueNotFoundComponent() {

    const handleToHome = (menu: string) => {
        const menu_link = new URL(`/${menu}`, window.location.origin)
        window.location.href = menu_link.href
    }

    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>404 - Not Found</EmptyTitle>
                <EmptyDescription>
                    The page you&apos;re looking for doesn&apos;t exist. Try searching for
                    what you need below.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <InputGroup className="sm:w-3/4">
                    <InputGroupInput placeholder="Try searching for menus..." />
                    <InputGroupAddon>
                        <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        <Kbd>/</Kbd>
                    </InputGroupAddon>
                </InputGroup>
                <EmptyDescription>
                    do u want to go{' '}
                    <Link href="/">
                        home
                    </Link> ?
                </EmptyDescription>
            </EmptyContent>
        </Empty>
    )
}