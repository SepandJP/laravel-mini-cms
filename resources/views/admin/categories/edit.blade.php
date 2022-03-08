<x-app-layout>

    @section('title')
        {{ 'Edit Category' }}
    @endsection

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __("Edit Category: $category->title") }}
        </h2>
    </x-slot>

    <x-slot name="main">
            <section>
                <div class="page-header min-vh-100">
                <div class="container">
                    <div class="col-xl-6 col-lg-7 col-md-9 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-7">
                       
                                <x-auth-validation-errors>
                                </x-auth-validation-errors>
                                
                                <form role="form" method="POST" action="{{ route('categories.update', $category->id) }}">
                                    @csrf
                                    @method('PATCH')

                                    <!-- Title -->
                                    <x-field class="mb-3">
                                        <x-label for="title" :value="__('Title')" />

                                        <x-input id="title" type="text" name="title" :value="$category->title" required/>
                                    </x-field>

                                    <!-- Slug -->
                                    <x-field class="mb-3">
                                        <x-label for="slug" :value="__('Slug')" />

                                        <x-input id="slug" type="text" name="slug" :value="$category->slug"/>
                                    </x-field>

                                    <!-- Meta Description -->
                                    <x-field class="mb-3">
                                        <x-label for="meta_description" :value="__('Meta Description')" />
                                        <x-input id="meta_description" type="text" name="meta_description" :value="$category->meta_description" />
                                    </x-field>

                                     <!-- Meta Keywords -->
                                     <x-field class="mb-3">
                                        <x-label for="meta_keywords" :value="__('Meta Keywords')" />
                                        <x-input id="meta_keywords" type="text" name="meta_keywords" :value="$category->meta_keywords" />
                                    </x-field>

                                    <div class="text-center pt-0 px-lg-2 px-1">
                                        <div class="text-center pt-0 px-lg-2 px-1">
                                            <button class="btn bg-gradient-warning btn-lg btn-lg mt-4 mb-0">
                                                {{ __('Edit') }}
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <!-- Delete Post -->
                                <form role="form" method="POST" action="{{ route('categories.destroy', $category->id) }}">
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
            </section>
    </x-slot>

</x-app-layout>