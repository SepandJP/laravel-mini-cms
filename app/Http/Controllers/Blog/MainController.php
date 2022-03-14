<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Post;

class MainController extends Controller
{
    public function index()
    {
        $posts = Post::where('status', 1)->latest()->paginate(5);
        $categories = Category::all();
        return view('blog.index', compact(['posts', 'categories']));
    }

    public function search()
    {
        $query = $_GET['title'];
        $posts = Post::where([
            ['status', '=', '1'],
            ['title', 'like', "%$query%"],
        ])
            ->orWhere('slug', 'like', "%$query%")
            ->orWhere('meta_keywords', 'like', "%$query%")
            ->orWhere('meta_description', 'like', "%$query%")
            ->latest()
            ->paginate(5);

        $categories = Category::all();
        return view('blog.search', compact(['posts', 'categories', 'query']));
    }
}
