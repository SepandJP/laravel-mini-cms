<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Photo;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function dashboard()
    {
        $postsCount = Post::count();
        $usersCount = User::count();
        $categoriesCount = Category::count();
        $photosCount = Photo::count();

        $posts = Post::latest()->limit(5)->get();
        $users = User::latest()->limit(5)->get();

        return view('admin.dashboard', compact(['postsCount', 'usersCount', 'categoriesCount', 'photosCount', 'posts', 'users']));
    }
}
