<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class AdminCommentsController extends Controller
{
    public function index()
    {
        $comments = Comment::latest()->paginate(30);
        return view('admin.comments.index', compact(['comments']));
    }

    public function action(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        
        if ($request->action)
        {
            if ($request->action == 'reject')
            {
                $comment->status = 0;
                $comment->save();
                Session::flash('reject_comment', 'Comment rejected');
            }

            elseif ($request->action == 'approve')
            {
                $comment->status = 1;
                $comment->save();
                Session::flash('approve_comment', 'Comment approved');
            }
        }

        return redirect()->route('comments.index');
    }

    public function edit($id)
    {
        $comment = Comment::findOrFail($id);
        return view('admin.comments.edit', compact(['comment']));
    }

    public function update(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->description = $request->description;
        $comment->save();
        Session::flash('edit_comment', 'Comment Edited Successfully');
        return redirect()->route('comments.index');
    }
}
