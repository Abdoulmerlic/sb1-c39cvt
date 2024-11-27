import { Observable } from '@nativescript/core';
import { Post } from '../models/post';

export class PostService extends Observable {
    private static instance: PostService;
    private _posts: Post[] = [];

    private constructor() {
        super();
    }

    static getInstance(): PostService {
        if (!PostService.instance) {
            PostService.instance = new PostService();
        }
        return PostService.instance;
    }

    getPosts(): Post[] {
        return this._posts;
    }

    addPost(post: Post): void {
        this._posts.unshift(post);
        this.notifyPropertyChange('posts', this._posts);
    }

    updatePostStatus(postId: string, status: Post['status']): void {
        const post = this._posts.find(p => p.id === postId);
        if (post) {
            post.status = status;
            this.notifyPropertyChange('posts', this._posts);
        }
    }
}