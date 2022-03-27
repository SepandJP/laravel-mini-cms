<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Category;
use App\Models\Comment;
use App\Models\User;

class ShowController extends Controller
{
    public function posts($slug)
    {
        $post = Post::where('slug', $slug)->first();
        $categories = Category::all();
        $comments = Comment::Where('post_id', $post->id)
        ->where('status', '1')
        ->where('parent_id', null)
        ->latest()->get();
        return view('blog.post', compact(['post', 'categories', 'comments']));
    }

    public function users($id)
    {
        $user = User::findOrFail($id);
        $posts = Post::where(['user_id' => $user->id, 'status' => 1])->latest()->paginate(5);
        $categories = Category::all();
        return view('blog.user', compact(['user', 'posts', 'categories']));
    }

    public function categories($slug)
    {
        $category = Category::where('slug', $slug)->first();
        $posts = Post::where(['category_id' => $category->id, 'status' => 1])->latest()->paginate(5);
        $categories = Category::all();
        return view('blog.category', compact(['category', 'posts', 'categories']));
    }
}
