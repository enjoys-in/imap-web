"use client"


import { useEffect, useState } from 'react'
interface ConfirmationModalProps {
    title: string
    message: string
    onConfirm: () => void
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm }) => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const hasConfirmed = localStorage.getItem('modalConfirmed')
        if (!hasConfirmed) {
            setIsOpen(true)
        }
    }, [])

    const handleConfirm = () => {
        localStorage.setItem('modalConfirmed', 'true')
        setIsOpen(false)
        onConfirm()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}
