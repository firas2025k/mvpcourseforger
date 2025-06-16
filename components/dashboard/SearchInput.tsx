// components/dashboard/SearchInput.tsx
"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { searchCourses } from "@/app/actions/search";
import { Suspense } from "react";
import Link from "next/link";

// Define the shape of a search result
type SearchResult = {
    id: string;
    title: string;
};

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [value, setValue] = useState(searchParams.get("q") || "");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const debouncedValue = useDebounce(value, 300);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Effect to perform the search when the debounced value changes
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedValue.length < 2) {
                setResults([]);
                setIsDropdownOpen(false);
                return;
            }
            setIsSearching(true);
            try {
                const searchResults = await searchCourses(debouncedValue);
                setResults(searchResults);
                setIsDropdownOpen(searchResults.length > 0);
            } catch (error) {
                console.error("Failed to fetch search results:", error);
                setResults([]);
                setIsDropdownOpen(false);
            } finally {
                setIsSearching(false);
            }
        };
        performSearch();
    }, [debouncedValue]);

    // Effect to update URL query parameter for main page filtering
    useEffect(() => {
        const currentQuery = searchParams.get("q") || "";
        if (debouncedValue === currentQuery) {
            return;
        }
        const params = new URLSearchParams(searchParams);
        if (debouncedValue) {
            params.set("q", debouncedValue);
        } else {
            params.delete("q");
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, [debouncedValue, router, searchParams, pathname]);

    // Effect to handle clicks outside the search component to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <Suspense>
 <div className="relative flex-1 md:grow-0" ref={searchContainerRef}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search courses..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => {
                    if (results.length > 0) {
                        setIsDropdownOpen(true);
                    }
                }}
            />
            {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-background shadow-lg z-50 max-h-60 overflow-y-auto">
                    {isSearching ? (
                        <p className="p-3 text-sm text-muted-foreground">Searching...</p>
                    ) : (
                        <ul>
                            {results.map((course) => (
                                <li key={course.id}>
                                    <Link
                                        href={`/dashboard/courses/${course.id}`}
                                        className="block w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
                                        onClick={() => {
                                            // Only close the dropdown on click, don't change the input value.
                                            // This prevents the useEffect from re-triggering and cancelling navigation.
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {course.title}
                                    </Link>
                                </li>
                            ))}
                            {results.length === 0 && debouncedValue.length > 1 && (
                                <p className="p-3 text-sm text-muted-foreground">No results found.</p>
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
        </Suspense>
       
    );
}
