<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostCreateRequest;
use App\Http\Requests\PostUpdateRequest;
use App\Models\Category;
use App\Models\Post;
use App\Models\Photo;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class AdminPostController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $posts = Post::latest()->paginate(10);
        return view('admin.posts.index', compact(['posts']));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $categories = Category::pluck('title', 'id');
        return view('admin.posts.create', compact(['categories']));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(PostCreateRequest $request)
    {
        $post = new Post();

        if ($file = $request->file('index_photo'))
        {
            $name = time() . $file->getClientOriginalName();
            $file->move('images', $name);
            $photo = new Photo();
            $photo->name = $file->getClientOriginalName();
            $photo->path = $name;
            $photo->user_id = Auth::id();
            $photo->save();

            $post->photo_id = $photo->id;
        }

        $post->title = $request->title;
        
        if ($request->slug)
        {
            $post->slug = Str::slug($request->slug);
        }
        else
        {
            $post->slug = Str::slug($request->title);
        }

        $post->description = $request->description;
        $post->meta_description = $request->meta_description;
        $post->meta_keywords = $request->meta_keywords;
        $post->user_id = Auth::id();
        $post->category_id = $request->category;
        $post->save();

        Session::flash('add_post', 'New post published successfully');

        return redirect()->route('posts.index');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $post = Post::findOrFail($id);
        $categories = Category::pluck('title', 'id');
        $selectedCategory[] = $post->category->id;
        return view('admin.posts.edit', compact(['post', 'categories', 'selectedCategory']));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(PostUpdateRequest $request, $id)
    {
        $post = Post::findOrFail($id);

        if ($file = $request->file('index_photo'))
        {
            $name = time() . $file->getClientOriginalName();
            $file->move('images', $name);
            $photo = new Photo();
            $photo->name = $file->getClientOriginalName();
            $photo->path = $name;
            $photo->user_id = Auth::id();
            $photo->save();

            $post->photo_id = $photo->id;
        }

        if ($request->slug)
        {
            $post->slug = Str::slug($request->title);
        }
        else
        {
            $post->slug = Str::slug($request->title);
        }

        $post->title = $request->title;
        $post->description = $request->description;
        $post->category_id = $request->category;
        $post->meta_description = $request->meta_description;
        $post->meta_keywords = $request->meta_keywords;
        
        $post->save();
        Session::flash('edit_post', 'Post modified successfully');
        return redirect()->route('posts.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        $photo = Photo::findOrFail($post->photo_id);
        unlink(public_path() . $post->photo->path);
        $photo->delete();
        $post->delete();

        Session::flash('delete_post', 'Post removed successfully');
        return redirect()->route('posts.index');
    }
}
