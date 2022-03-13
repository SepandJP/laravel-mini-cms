@extends('layouts.blog.master')

@section('meta')
    <meta name="description" content="A blog mini CMS with Laravel" />
    <meta name="author" content="Sepand JamshidPour" />
@endsection

@section('title')
    {{ 'Home' }}
@endsection

@section('header')
    <!-- Page Header-->
    <header class="masthead" style="background-image: url('{{  asset('images/img/home-bg.jpg')}}')">
        <div class="container position-relative px-4 px-lg-5">
            <div class="row gx-4 gx-lg-5 justify-content-center">
                <div class="col-md-10 col-lg-8 col-xl-7">
                    <div class="site-heading">
                        <h1>{{ config('app.name') }}</h1>
                        <span class="subheading">A blog mini CMS with Laravel</span>
                    </div>
                </div>
            </div>
        </div>
    </header>
@endsection

@section('main')
    <!-- Main Content-->
    <main class="container px-4 px-lg-5">
        <div class="row gx-4 gx-lg-5 justify-content-center">
            <div class="col-md-10 col-lg-8 col-xl-7">

                @foreach ($posts as $post)
                    <!-- Post preview-->
                    <div class="post-preview">
                        <a href="{{ route('show.post', $post->slug) }}">
                            <h2 class="post-title">{{ $post->title }}</h2>
                            <h5 class="post-subtitle">{{ Str::limit($post->description, 120, '...') }}</h5>
                        </a>
                        <div class="row">
                            <div class="d-flex justify-content-start mb-4">
                                <a class="btn btn-sm btn-secondary text-uppercase p-2 px-3" href="{{ route('show.post', $post->slug) }}">Read More →</a>
                            </div>
                        </div>

                        <!-- Post's Category -->
                            <span class="btn btn-dark btn-sm rounded-pill  display-6">
                                <a href="" class="text-white">
                                    #{{ $post->category->title }}
                                </a>
                            </span>
                        <!-- End of Post's Category -->

                        <p class="post-meta">
                            Posted by
                            <a href="#!">{{ $post->user->name }}</a>
                            on {{ $post->created_at }}
                        </p>
                    </div>
                    <!-- Divider-->
                    <hr class="my-4" />
                @endforeach
   
                <!-- Pager-->
                <div class="d-flex justify-content-center mb-2">
                    Show
                    {{($posts->currentPage()-1)* $posts->perPage() + 1}}
                    to 
                    {{ ($posts->currentPage()* $posts->perPage()) }}
                    from   
                    {{ $posts->total() }}
                    posts
                </div>

                @if ($posts->currentPage() == 1)
                    <div class="row">
                        <div class="d-flex justify-content-end mb-4">
                            <a class="btn btn-primary text-uppercase" href="{{ $posts->nextPageUrl() }}">Older Posts →</a>
                        </div>
                    </div>
                @elseif ($posts->currentPage() == $posts->lastPage())
                    <div class="row">
                        <div class="row col-sm-5 justify-content-start mb-4">
                            <a class="btn btn-primary text-uppercase" href="{{ $posts->previousPageUrl() }}"> ← Newer Posts </a>
                        </div>
                    </div>
                @else
                <div class="row">
                    <div class="row col-sm-5 justify-content-start mb-4">
                        <a class="btn btn-primary text-uppercase" href="{{ $posts->previousPageUrl() }}"> ← Newer Posts </a>
                    </div>
                    <div class="row col-sm-2">
                    </div>
                    <div class="row col-sm-5 justify-content-end mb-4">
                        <a class="btn btn-primary text-uppercase" href="{{ $posts->nextPageUrl() }}">Older Posts →</a>
                    </div>
                </div>
                @endif
                                
            </div>
        </div>
    </main>
@endsection
