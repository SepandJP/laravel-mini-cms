<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\Request;

class MainController extends Controller
{
    public function index()
    {
        $posts = Post::where('status', 1)->latest()->paginate(5);
        $categories = Category::all();
        return view('blog.index', compact(['posts', 'categories']));
    }

    
}
