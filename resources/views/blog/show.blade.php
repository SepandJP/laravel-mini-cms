@extends('layouts.blog.master')

@section('meta')
    <meta name="description" content="{{ $post->meta_description ? $post->meta_description : "A blog mini CMS with Laravel" }}" />
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
                                    <a href="" class="text-white">
                                        #{{ $post->category->title }}
                                    </a>
                                </h2>
                            </div>
                            <span class="meta">
                                Posted by
                                <a href="#!">{{ $post->user->name }}</a>
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
@endsection