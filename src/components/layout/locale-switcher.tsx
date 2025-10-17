import { useLocale } from "next-intl"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setUserLocale } from "@/i18n/local"
import { useTransition } from "react"
import { fullname_locales, type Locale } from "@/i18n/config"


export default function LocaleSwitcher() {
    const locale = useLocale()
    const [isPending, startTransition] = useTransition();


    const switchLocale = (newLocale: Locale) => {
        if (newLocale !== locale) {
            startTransition(() => {
                setUserLocale(newLocale);
            });
        }
    };


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button disabled={isPending} variant="outline" className="flex items-center gap-2">
                    <GlobeIcon className="h-5 w-5" />
                    <span>{locale}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {fullname_locales.map((loc) => (
                    <DropdownMenuItem key={loc.code} onClick={() => switchLocale(loc.code)}>
                        {loc.name}
                        {loc.code === locale && <CheckIcon className="h-5 w-5" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}