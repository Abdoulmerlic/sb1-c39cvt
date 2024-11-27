export interface Post {
    id: string;
    content: string;
    scheduledDate: Date;
    platform: 'twitter' | 'instagram' | 'facebook';
    status: 'scheduled' | 'posted' | 'failed';
}