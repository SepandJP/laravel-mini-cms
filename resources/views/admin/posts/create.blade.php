<x-app-layout>

    @section('title')
        {{ 'New Post' }}
    @endsection

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Write New Post') }}
        </h2>
    </x-slot>

    <x-slot name="main">
            <section>
                <div class="page-header min-vh-100">
                <div class="container">
                    <div class="col-xl-8 col-lg-10 col-md-12 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-7">
                       
                                <x-auth-validation-errors>
                                </x-auth-validation-errors>
                                
                                <form role="form" method="POST" action="{{ route('posts.store') }}" accept-charset="UTF-8" enctype="multipart/form-data">
                                    @csrf

                                    <!-- Title -->
                                    <x-label for="title" :value="__('Title')" />
                                    <x-field class="mb-3">
                                        <x-input id="title" type="text" name="title" :value="old('title')" required />
                                    </x-field>

                                    <!-- Slug -->
                                    <x-label for="slug" :value="__('Slug')" />
                                    <x-field class="mb-3">
                                        <x-input id="slug" type="text" name="slug" :value="old('slug')" />
                                    </x-field>

                                     <!-- Description -->
                                     <x-label for="description" :value="__('Description')" />
                                    <div class="input-group input-group-outline">
                                        <textarea rows="20" class="form-control" id="description" type="textarea" name="description" required>{{old('description')}}</textarea>
                                    </div>
                                    
                                    <!-- Categories -->
                                        <x-label class="mt-5" for="categories" :value="__('Category')" />
                                        <select class="form-select" name="category" id="category" required>
                                                @foreach ($categories as $key => $value)
                                                    <option value="{{$key}}">{{$value}}</option>
                                                @endforeach
                                          </select>

                                    <!-- Index Photo (Avatar) -->
                                    <x-label class="mt-5" for="index_photo" :value="__('Index Photo')" />
                                    <x-field class="mb-3">
                                        <x-input id="index_pphoto" type="file" name="index_photo" accept="image/*"/>
                                    </x-field>

                                     <!-- Meta Description -->
                                     <x-label for="meta_description" :value="__('Meta Description')" />
                                     <x-field class="mb-3">
                                        <x-input id="meta_description" type="text" name="meta_description" :value="old('meta_description')" />
                                    </x-field>

                                     <!-- Meta Keywords -->
                                     <x-label for="meta_keywords" :value="__('Meta Keywords')" />
                                     <x-field class="mb-3">
                                        <x-input id="meta_keywords" type="text" name="meta_keywords" :value="old('meta_keywords')" />
                                    </x-field>

                                    <div class="pb-5 text-center pt-0 px-lg-2 px-1">
                                        <div class="text-center pt-0 px-lg-2 px-1">
                                            <x-button class="btn-lg btn-lg mt-4 mb-0">
                                                {{ __('Publish') }}
                                            </x-button>
                                        </div>
                                    </div>
                                </form>
                    </div>
                </div>
                </div>
            </section>
    </x-slot>

</x-app-layout>