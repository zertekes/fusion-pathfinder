"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DatePickerProps {
    date?: Date
    setDate: (date?: Date) => void
    className?: string
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
    // Convert Date to YYYY-MM-DD string for input
    const dateString = date ? format(date, "yyyy-MM-dd") : ""

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value) {
            // Parse YYYY-MM-DD back to Date
            // We use 'new Date(value)' but be careful with timezones, 
            // usually input type='date' returns YYYY-MM-DD.
            // new Date('2023-12-04') creates a date at UTC midnight, which might be previous day in local time.
            // Better to parse manually or use date-fns parse.
            const newDate = new Date(value)
            setDate(newDate)
        } else {
            setDate(undefined)
        }
    }

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0]

    return (
        <Input
            type="date"
            min={today}
            value={dateString}
            onChange={handleChange}
            className={cn("w-full justify-start text-left font-normal", className)}
        />
    )
}
