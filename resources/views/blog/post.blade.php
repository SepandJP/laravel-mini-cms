@extends('layouts.blog.master')

@section('meta')
    <meta name="description" content="{{ $post->meta_description ? $post->meta_description : "A blog mini CMS with Laravel" }}" />
    <meta name="keywords" content="{{ $post->meta_keywords ? $post->meta_keywords : "blog , CMS , php , Laravel" }}" />
    <meta name="author" content="{{ $post->user->name }}" />
@endsection

@section('title')
    {{ $post->title }}
@endsection

@section('header')
           <!-- Page Header-->
           <header class="masthead" style="background-image: url('{{ $post->photo_id ? $post->photo->path : asset('images/img/post-bg.jpg') }}')">
            <div class="container position-relative px-4 px-lg-5">
                <div class="row gx-4 gx-lg-5 justify-content-center">
                    <div class="col-md-10 col-lg-8 col-xl-7">
                        <div class="post-heading">
                            <h1 class="mb-5">{{ $post->title }}</h1>
                            <!-- Category -->
                            <div class="d-flex justify-content-center">
                                <h2 class="btn btn-dark btn-sm rounded-pill  display-6">
                                    <a href="{{ route('show.category', $post->category->slug) }}" class="text-white">
                                        #{{ $post->category->title }}
                                    </a>
                                </h2>
                            </div>
                            <span class="meta">
                                Posted by
                                <a href="{{ route('show.user', $post->user->id) }}">{{ $post->user->name }}</a>
                                on {{ $post->created_at }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
@endsection

@section('main')
                <!-- Post Content-->
                <article class="mb-4">
                    <div class="container px-4 px-lg-5">
                        <div class="row gx-4 gx-lg-5 justify-content-center">
                            <div class="col-md-10 col-lg-8 col-xl-7">
                                {{ $post->description }}
                            </div>
                        </div>
                    </div>
                </article>

                <!-- Comments -->
                <section class="container my-5 py-5">

                    <!-- Writting a New Comment -->
                    <section class="d-flex justify-content-center">
                        <div class="col-md-10 col-lg-8 col-xl-7">
                            
                            <x-auth-session-status class="alert-success small" :status="__('add_comment')" >
                            </x-auth-session-status>
                            
                            <div class="py-3">
                                <div class="d-flex flex-start w-100">
                                    @if ( Auth::user() )
                                        <img
                                        class="rounded-circle shadow-1-strong me-3"
                                        src="{{ asset(Auth::user()->photo->path ) }}"
                                        alt="avatar"
                                        width="40"
                                        height="40"
                                        />
                                    @else
                                    <img
                                        class="rounded-circle shadow-1-strong me-3"
                                        src="{{ asset('images/img/Default_Avatar.jpg') }}"
                                        alt="avatar"
                                        width="40"
                                        height="40"
                                    />
                                    @endif
                                        <form class="form-floating  w-100" method="POST" action="{{ route('comment.add', $post->id) }}">
                                            @csrf
                                            
                                            <x-field>
                                                @if (Auth::user())
                                                    <x-input type="text" id="userName" name="name" placeholder="Your name" value="{{Auth::user()->name}}" :disabled="true" />
                                                @else
                                                    <x-input type="text" id="userName" name="name" placeholder="Your name" />
                                                @endif
                                                <x-label for="userName" :value="__('Post Comment as ')" />
                                            </x-field>
                                            
                                            <x-field>
                                                <textarea
                                                    required
                                                    name="description"
                                                    class="form-control"
                                                    placeholder="Leave a comment here"
                                                    id="newComment"
                                                    style="height: 100px"
                                                ></textarea>
                                                <x-label for="newComment" :value="__('Leave a comment here...')" />
                                            </x-field>

                                            <button type="submit" class="float-end mt-2 pt-1 btn btn-primary btn-sm">Post comment</button>
                                        </form>
                                </div>
                            </div>
                        </div>
                    </section>
                    <!-- End of writing a new comment -->

                    <!-- Show Comments -->
                    <section class="container mb-3 py-5">
                        <div class="row d-flex justify-content-center">
                            <div class="col-md-12 col-lg-10 col-xl-8">
                                <div class="card">
                                    <div class="card-body p-4">
                                        <div class="py-3 d-flex justify-content-center">
                                            <div class="px-3">
                                                <h4 class="text-center mb-4 pb-2">
                                                    Comments
                                                </h4>
                                            </div>
                                            <div class="px-3">
                                                <i class="fas fa-comments">
                                                    {{ $post->comments->where('status', 1)->count() }}
                                                </i>
                                            </div>
                                        </div>

                    @include('layouts.blog.comments', ['comments' => $comments, 'post' => $post])
                    
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <!-- End of show comments -->

                </section>
                <!-- End of comments -->
@endsection