<x-app-layout>

    @section('title')
        {{ 'Add Category' }}
    @endsection

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Add New Category') }}
        </h2>
    </x-slot>

    <x-slot name="main">
            <section>
                <div class="page-header min-vh-100">
                <div class="container">
                    <div class="col-xl-6 col-lg-8 col-md-10 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-7">
                       
                                <x-auth-validation-errors>
                                </x-auth-validation-errors>
                                
                                <form role="form" method="POST" action="{{ route('categories.store') }}">
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

                                    <div class="text-center px-lg-2">
                                        <div class="text-center px-lg-2">
                                            <x-button class="btn-lg mt-4 mb-0">
                                                {{ __('Add Category') }}
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