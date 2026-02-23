export interface TargetPerformanceItem {
    id: string;
    name: string;
    role: string;
    target: string;
    achieved: string;
    bookings: string;
    achievementPercentage: number;
    status: 'High' | 'Medium' | 'Low' | 'At Risk';
}

