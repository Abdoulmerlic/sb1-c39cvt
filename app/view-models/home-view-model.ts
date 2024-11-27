import { Observable, alert } from '@nativescript/core';
import { Post } from '../models/post';
import { PostService } from '../services/post-service';
import { PlatformService } from '../services/platform-service';
import { format } from 'date-fns';

export class HomeViewModel extends Observable {
    private postService: PostService;
    private platformService: PlatformService;
    private _newPostContent: string = '';
    private _selectedDate: Date = new Date();
    private _platformIndex: number = 0;
    private _platformOptions = ['Twitter', 'Instagram', 'Facebook'];
    private _isLoading: boolean = false;

    constructor() {
        super();
        this.postService = PostService.getInstance();
        this.platformService = PlatformService.getInstance();
        this.checkInitialSetup();
    }

    private async checkInitialSetup() {
        if (!this.platformService.isTwitterInstalled()) {
            await alert({
                title: "Twitter Not Found",
                message: "Please install Twitter to use this app",
                okButtonText: "OK"
            });
        }

        const hasPermissions = await this.platformService.checkPermissions();
        if (!hasPermissions) {
            await alert({
                title: "Permissions Required",
                message: "Please grant necessary permissions to continue",
                okButtonText: "OK"
            });
        }
    }

    get posts(): Post[] {
        return this.postService.getPosts();
    }

    get newPostContent(): string {
        return this._newPostContent;
    }

    set newPostContent(value: string) {
        if (this._newPostContent !== value) {
            this._newPostContent = value;
            this.notifyPropertyChange('newPostContent', value);
        }
    }

    get selectedDate(): Date {
        return this._selectedDate;
    }

    set selectedDate(value: Date) {
        if (this._selectedDate !== value) {
            this._selectedDate = value;
            this.notifyPropertyChange('selectedDate', value);
        }
    }

    get platformOptions(): string[] {
        return this._platformOptions;
    }

    get platformIndex(): number {
        return this._platformIndex;
    }

    set platformIndex(value: number) {
        if (this._platformIndex !== value) {
            this._platformIndex = value;
            this.notifyPropertyChange('platformIndex', value);
        }
    }

    get isLoading(): boolean {
        return this._isLoading;
    }

    set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value;
            this.notifyPropertyChange('isLoading', value);
        }
    }

    getPlatformType(): Post['platform'] {
        switch (this._platformIndex) {
            case 0: return 'twitter';
            case 1: return 'instagram';
            case 2: return 'facebook';
            default: return 'twitter';
        }
    }

    async schedulePost() {
        if (!this.newPostContent.trim()) {
            await alert({
                title: "Error",
                message: "Please enter post content",
                okButtonText: "OK"
            });
            return;
        }

        try {
            this.isLoading = true;

            const shared = await this.platformService.shareToTwitter(this.newPostContent);
            
            if (shared) {
                const newPost: Post = {
                    id: Date.now().toString(),
                    content: this.newPostContent,
                    scheduledDate: this._selectedDate,
                    platform: this.getPlatformType(),
                    status: 'posted'
                };

                this.postService.addPost(newPost);
                this.newPostContent = '';
            } else {
                await alert({
                    title: "Error",
                    message: "Failed to share post",
                    okButtonText: "OK"
                });
            }
        } catch (error) {
            console.error('Error scheduling post:', error);
            await alert({
                title: "Error",
                message: "An unexpected error occurred",
                okButtonText: "OK"
            });
        } finally {
            this.isLoading = false;
        }
    }

    formatDate(date: Date): string {
        return format(date, 'MMM dd, yyyy HH:mm');
    }
}