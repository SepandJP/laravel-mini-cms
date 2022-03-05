<x-app-layout>

    @section('title')
        {{ 'Edit Post' }}
    @endsection

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __("Edit Post: $post->title") }}
        </h2>
    </x-slot>

    <x-slot name="main">
            <section>
                <div class="page-header min-vh-100">
                <div class="container">
                    <div class="row">
                        <!-- Index Image -->
                    <div class="col-md-3">
                        <img src="{{$post->photo_id ? $post->photo->path : "/images/Default_Post.jpg"}}" class="img-fluid">
                    </div>
                    <div class="col-xl-6 col-lg-7 col-md-9 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-7">
                       
                                <x-auth-validation-errors>
                                </x-auth-validation-errors>
                                
                                <form role="form" method="POST" action="{{ route('posts.update', $post->id) }}" accept-charset="UTF-8" enctype="multipart/form-data">
                                    @csrf
                                    @method('PATCH')

                                    <!-- Title -->
                                    <x-field class="mb-3">
                                        <x-label for="title" :value="__('Title')" />

                                        <x-input id="title" type="text" name="title" :value="$post->title" required/>
                                    </x-field>

                                    <!-- Slug -->
                                    <x-field class="mb-3">
                                        <x-label for="slug" :value="__('Slug')" />

                                        <x-input id="slug" type="text" name="slug" :value="$post->slug" required />
                                    </x-field>

                                    <!-- Description -->
                                    <x-field class="mb-3">
                                        <x-label for="description" :value="__('Description')" />
                                        <textarea rows="20" class="form-control" id="description" type="textarea" name="description" required autofocus>{{$post->description}}</textarea>
                                    </x-field>

                                    <!-- Category -->
                                    {{-- <x-field class="mb-3"> --}}
                                        <x-label for="category" :value="__('Category')" />

                                        <select class="form-select" name="category" id="category" aria-label="category select" required>
                                                @foreach ($categories as $key => $value)
                                                    <option value="{{$key}}" {{in_array($key, $selectedCategory) ? 'selected' : ''}}>{{$value}}</option>

                                                    {{-- <div class="form-check form-check-inline">
                                                        <input class="form-check-input" type="checkbox" name="roleCheckbox{{$key}}" id="roleCheckbox{{$key}}" value="{{$key}}">
                                                        <label class="form-check-label" for="roleCheckbox{{$key}}">{{$value}}</label>
                                                      </div> --}}
                                                @endforeach
                                          </select>
                                    {{-- </x-field> --}}

                                    <!-- Index Photo (Avatar) -->
                                    <x-field class="mb-3">
                                        <x-label for="index_photo" :value="__('Change Index Photo')" />

                                        <x-input id="index_photo" type="file" name="index_photo" accept="image/*"/>
                                    </x-field>

                                    <!-- Meta Description -->
                                    <x-field class="mb-3">
                                        <x-label for="meta_description" :value="__('Meta Description')" />
                                        <x-input id="meta_description" type="text" name="meta_description" :value="$post->meta_description" />
                                    </x-field>

                                     <!-- Meta Keywords -->
                                     <x-field class="mb-3">
                                        <x-label for="meta_keywords" :value="__('Meta Keywords')" />
                                        <x-input id="meta_keywords" type="text" name="meta_keywords" :value="$post->meta_keywords" />
                                    </x-field>

                                    <input type="hidden" name="id" value="{{$post->id}}">

                                    <div class="text-center pt-0 px-lg-2 px-1">
                                        <div class="text-center pt-0 px-lg-2 px-1">
                                            <button class="btn bg-gradient-warning btn-lg btn-lg mt-4 mb-0">
                                                {{ __('Edit') }}
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <!-- Delete Post -->
                                <form role="form" method="POST" action="{{ route('posts.destroy', $post->id) }}">
                                    @csrf
                                    @method('DELETE')

                                    <div class="text-center pt-0 px-lg-2 px-1">
                                        <div class="text-center pt-0 px-lg-2 px-1">
                                            <button class="btn bg-gradient-danger btn-lg btn-lg mt-4 mb-0">
                                                {{ __('Delete') }}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                    </div>
                    </div>
                </div>
                </div>
            </section>
    </x-slot>

</x-app-layout>