import { useState, useEffect, useRef } from 'react';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function UserDropdown() {
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setIsOpen(false);
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (!user) {
        return null;
    }

    // Get user initials for avatar
    const getInitials = () => {
        if (user.displayName) {
            return user.displayName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return user.email?.[0]?.toUpperCase() || 'U';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
            >
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName || user.email}
                        className="w-8 h-8 rounded-full border-2 border-gray-600"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials()}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            {user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || user.email}
                                    className="w-12 h-12 rounded-full border-2 border-gray-600"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                                    {getInitials()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {user.displayName || 'User'}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="py-2">
                        <a
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Dashboard
                        </a>
                        <a
                            href="/pricing"
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Pricing
                        </a>
                    </div>

                    <div className="border-t border-gray-700 py-2">
                        <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
