<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Post;

class ShowController extends Controller
{
    public function posts($slug)
    {
        $post = Post::where(['slug', $slug])->first();
        return view('blog.show', compact(['post']));
    }
}
