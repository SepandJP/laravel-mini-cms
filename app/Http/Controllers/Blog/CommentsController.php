<?php

namespace App\Http\Controllers\Blog;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class CommentsController extends Controller
{
    public function store(Request $request, $postId)
    {
        if (Post::findOrFail($postId))
        {
            $comment = new Comment();
            $comment->description = $request->description;
            $comment->post_id = $postId;
            $comment->user_name = $request->name;
            $comment->user_id = Auth::id();
            $comment->save();
        }
        Session::flash('add_comment', 'Your comment has been successfully saved and is awaiting approval from admins.');
        return redirect()->back();
    }
}
