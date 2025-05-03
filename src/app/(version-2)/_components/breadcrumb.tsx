import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,

} from "@/components/ui/breadcrumb"
 
const BreadcrumbInfo = () => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                    <BreadcrumbPage>Inbox</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
            
        </Breadcrumb>
    )
}

export default BreadcrumbInfo