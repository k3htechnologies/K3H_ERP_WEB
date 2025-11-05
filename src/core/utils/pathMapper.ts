export const mapPathToRoute = (apiPath: string): string => {
    const routeMap: Record<string, string> = {
        '/departmentmaster': '/departmentMaster',
        '/designationmaster': '/designationMaster',
        '/employeemaster': '/employeeMaster'
    };

    return routeMap[apiPath] || '/dashboard';
};
