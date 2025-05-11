
import React from 'react';
import { CrownIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
function MyAddresses() {
    return (
        <div className="min-h-screen bg-[#171717] text-white">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold">My addresses</h1>
                        <p className="text-zinc-400">
                            Use the different types of email addresses and aliases offered by Proton.{' '}
                            <a href="#" className="text-blue-500 hover:underline">
                                Learn more
                            </a>
                        </p>
                    </div>

                    <div>
                        <Button
                            variant="outline"
                            className="border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300"
                        >
                            <CrownIcon className="w-4 h-4 mr-2 text-yellow-500" />
                            Get more addresses
                        </Button>
                    </div>

                    <div className="bg-[#1C1C1C] rounded-md overflow-hidden">
                        <AddressTable />
                    </div>
                </div>
            </div>
        </div>
    );
}



interface AddressProps {
    email: string;
    isDefault: boolean;
    isActive: boolean;
}

const AddressTable: React.FC = () => {
    const addresses: AddressProps[] = [
        {
            email: 'enjoys06@protonmail.com',
            isDefault: true,
            isActive: true,
        }
    ];

    return (
        <div className="w-full">
            <div className="grid grid-cols-12 py-4 border-b border-zinc-800 px-4">
                <div className="col-span-4 sm:col-span-5 font-medium text-sm text-zinc-200">
                    Address
                </div>
                <div className="col-span-4 sm:col-span-5 font-medium text-sm text-zinc-200">
                    Status
                </div>
                <div className="col-span-4 sm:col-span-2 font-medium text-sm text-zinc-200 text-right">
                    Actions
                </div>
            </div>

            {addresses.map((address) => (
                <div
                    key={address.email}
                    className="grid grid-cols-12 py-4 border-b border-zinc-800 px-4 items-center"
                >
                    <div className="col-span-4 sm:col-span-5 flex items-center gap-2">
                        <div className="text-zinc-300 flex items-center">
                            <MoreHorizontal className="w-4 h-4 text-zinc-600 mr-2" />
                            <span className="text-sm">{address.email}</span>
                        </div>
                    </div>

                    <div className="col-span-4 sm:col-span-5">
                        <div className="flex space-x-2">
                            {address.isDefault && (
                                <Badge  className="uppercase text-[10px] font-medium">
                                    Default
                                </Badge>
                            )}
                            {address.isActive && (
                                <Badge  className="uppercase text-[10px] font-medium">
                                    Active
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="col-span-4 sm:col-span-2 flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs h-8 px-4 border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300">
                            Edit
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

