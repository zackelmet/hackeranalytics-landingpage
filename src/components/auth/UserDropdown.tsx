import { useState, useRef } from 'react';

// For the landing site we no longer manage auth client-side here.
// Render a simple "Open App" control that sends users to the hosted app.
export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com';

    return (
        <div className="relative" ref={dropdownRef}>
            <a
                href={appUrl}
                className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">App</div>
            </a>
        </div>
    );
}
