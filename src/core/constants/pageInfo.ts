export const getPageInfo = (path: string) => {
    switch (path) {
        case '/dashboard':
            return {
                title: 'Dashboard',
                description: 'Overview of your system and key metrics',
            }
        case '/departmentMaster':
            return {
                title: 'Settings - Company setup (Department)',
                description: 'Manage and organize company departments with complete CRUD operations',
            }
        // ✅ Add other cases here...
        default:
            return {
                title: 'Dashboard',
                description: 'Overview of your system and key metrics',
            }
    }
}
