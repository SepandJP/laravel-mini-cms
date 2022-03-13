<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Category;

class ShowController extends Controller
{
    public function posts($slug)
    {
        $post = Post::where('slug', $slug)->first();
        $categories = Category::all();
        return view('blog.show', compact(['post', 'categories']));
    }
}
